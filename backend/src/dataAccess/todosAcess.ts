import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
//import { TodoUpdate } from '../models/TodoUpdate';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodoAccess {

    constructor(
      private readonly docClient: DocumentClient = createDynamoDBClient(),
      private readonly todosTable = process.env.TODOS_TABLE,
      private readonly todosTableIndex = process.env.TODOS_CREATED_AT_INDEX,

      ) {
    }
  
    async getTodos(userId: string): Promise<TodoItem[]> {

      logger.info('Getting all Todos for user '+userId,this.todosTableIndex)

      const result = await this.docClient.query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :idUser',
        ExpressionAttributeValues: {
          ':idUser': userId
        }
      }).promise()
    
      return result.Items as TodoItem[]
    }

    async getTodo(userId: string, todoId: string): Promise<TodoItem> {

      logger.info('Getting a Todo for user & todoId'+userId+" : "+todoId)

      const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        }
      })
      .promise()

      return result.Item as TodoItem
    }
  
    async createTodo(todo: TodoItem): Promise<TodoItem> {
      logger.info('createTodo ')

      await this.docClient.put({
        TableName: this.todosTable,
        Item: todo
      }).promise()
  
      return todo
    }

    async updateTodo(userId: String, todoId: string, updateTodoRequest : UpdateTodoRequest) {
      logger.info('updateTodo '+userId+" : "+todoId,updateTodoRequest)

      await this.docClient.update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
        ExpressionAttributeNames: {
          '#Tname': 'name'
        },
        UpdateExpression: 'SET #Tname = :titleName, dueDate = :dueDate, done = :done',
        ExpressionAttributeValues: {
          ':titleName': updateTodoRequest.name,
          ':dueDate': updateTodoRequest.dueDate,
          ':done': updateTodoRequest.done
        }
      }).promise()
    }

    async updateTodoAttachmentUrl(userId: String, todoId: string, url : string) {
      logger.info('updateTodo '+userId+" : "+todoId)

      await this.docClient.update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': url
        }
      }).promise()
    }

    async deleteTodo(userId: String, todoId: string) {

      logger.info('deleTeTodo '+userId+" : "+todoId)


      await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        }
      }).promise()
    }
  }
  
  function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      logger.info('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }

