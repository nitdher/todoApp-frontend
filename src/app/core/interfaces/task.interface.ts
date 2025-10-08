export interface Task {
  id?: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateTaskDTO {
  userId: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  completed?: boolean;
}
