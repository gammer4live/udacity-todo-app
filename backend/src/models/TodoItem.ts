export interface TodoItem {
  todoId: string
  createdAt: string
  userId: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
