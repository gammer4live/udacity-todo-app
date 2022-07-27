import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const logger = createLogger('createPresignedUrl')


const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

export class AttachmentUtils {

    constructor(
      private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
      private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
      ) {
    }

    async  getPresignedUrl(resourceId: String): Promise<String> {
        logger.info('getPresignedUrl '+resourceId)
    
        const s3 = new XAWS.S3({
          signatureVersion: 'v4'
        })
        
        logger.info('getPresignedUrl  params '+this.bucketName+" "+this.urlExpiration)


        var urlString = await s3.getSignedUrl('putObject', {
          Key: resourceId,
          Bucket: this.bucketName,
          Expires: this.urlExpiration
        })

        return urlString
    
      }

      generateResourceURL(resourceId: String): string{
        logger.info('generateResourceURL '+resourceId)

        return `https://${this.bucketName}.s3.amazonaws.com/${resourceId}`

      }
}