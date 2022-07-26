import { TodoAccess } from '../dataAccess/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'
//import { getUserId } from '../lambda/utils';
//import * as AWS from 'aws-sdk'
// TODO: Implement businessLogic

const logger = createLogger('Todo')

/*const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
*/
const todosAccess = new TodoAccess()
const s3Util = new AttachmentUtils()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info("BL getTodosForUser : "+userId)
  return todosAccess.getTodos(userId)
}

export async function createTodo(userId: string,
    createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {

  logger.info("BL createTodos : "+userId)

  const itemId = uuid.v4()

  return await todosAccess.createTodo({
    todoId: itemId,
    userId: userId,
    ...createTodoRequest
  })

  
}

export async function updateTodo(userId: string, todoId : string,
  updateTodoRequest: UpdateTodoRequest
) {

logger.info("BL updateTodo : "+userId)
 await todosAccess.updateTodo(userId,todoId,updateTodoRequest)

}

export async function deleteTodo(userId: string, todoId : string
) {

logger.info("BL updateTodo : "+userId)
 await todosAccess.deleteTodo(userId,todoId)

}



export async function createAttachmentPresignedUrl (userId: string, todoId : string
  ): Promise<String> {
  
  logger.info("BL createAttachmentPresignedUrl : "+userId+" "+todoId)

  const todoItem = await todosAccess.getTodo(userId,todoId)

  if(todoItem)
  {
    const url = await createPresignedUrl(todoItem.todoId)

    if(url)
    {
      const resourceUrl = s3Util.generateResourceURL(todoItem.todoId)

      await todosAccess.updateTodoAttachmentUrl(userId,todoId,resourceUrl)
    }

    return url
  }

    return null  
  }

  async function createPresignedUrl(id: String): Promise<String> {
    logger.info('createTodo ')
    return s3Util.getPresignedUrl(id)

  }