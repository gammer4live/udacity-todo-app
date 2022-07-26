import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-e4ayu24b.us.auth0.com/.well-known/jwks.json'

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJSYp03FI6ttJOMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1lNGF5dTI0Yi51cy5hdXRoMC5jb20wHhcNMjIwNzIxMjE1MzQ2WhcN
MzYwMzI5MjE1MzQ2WjAkMSIwIAYDVQQDExlkZXYtZTRheXUyNGIudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxRt2LCs9H/OQGlSp
bBgN2NZFJFvhV9fWR/J30eDyDJ9T3TJDeflnSY1UCTv7Gw0qF/+nbJrjBGth8eqc
DA6bcXFW0eu1NFueskhX4457Drto7h5b4dB53/rCSJJKkmx2CAK3GqYcoeCODccF
rbABIPcYRdjYS79YRk3GD8wsi1Ml4jYbqf4zGm1OMLF+HARH79eGc+8ByimOhn+W
1BX66/zJDi4GKcAo7A1aTyeB3PnXglYZ2BNYtodkLRH9PSTSoh5TNakVcKrnSuhl
y674zypY7oEWhKT0Xakr8us9QrNB7ir2IttBgEYmd0u/EQT6xrbhtHJayh3ccawU
EZnt2wIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTGeBWAiGQB
ai14HdJd5mzt9ECE6DAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ACbYsqCD7ha0Clkh3QhV8xHS9gvbgDJmJ/7M+Gik+Nz95qiXQAzCA4E4ZDsoOL7w
9QHECGBycR93Jsi3UqA+CHjgrizv9Woiuwwnxek1KVLjzaQNeiUSJ2RxGv/lY5qL
WFjU7gCWwytC/LlKwG4obvsqVui/6/IRzEeo+Ie3KUet8PP+DsG6NGbW5gABNnee
FNxcikiOo6kCwE6NGeCkvwGqcmbXXt7pG0Ue38W++mwLPFGkwfw670UBjWEbZED4
oYy+bHC5/W6K0AK37tsSrpJRQHW8y9KdQw8W1T1L/To7sDyHb0wCkQ3dOXGsFdD8
nVz7GWwWIe1b8az/71iyAk0=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/


  return  verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  logger.info('getToken results', token)


  return token
}
