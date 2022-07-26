import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const logger = createLogger('createPresignedUrl')


const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

export class AttachmentUtils {

    constructor(
      private readonly bucketName = process.env.IMAGES_S3_BUCKET,
      private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
      ) {
    }

    async  getPresignedUrl(id: String): Promise<String> {
        logger.info('getPresignedUrl ')
    
        const s3 = new XAWS.S3({
          signatureVersion: 'v4'
        })
        
        return s3.getSignedUrl('putObject', {
          Bucket: this.bucketName,
          Key: id,
          Expires: this.urlExpiration
        })
    
      }

      generateResourceURL(resourceId: String): string{

        return `https://${this.bucketName}.s3.amazonaws.com/${resourceId}`

      }
}