export const API_ENDPOINTS = {
  USERS: {
    CHECK: '/users/check',
    CREATE: '/users'
  },
  TASKS: {
    GET_BY_USER: (userId: string) => `/tasks/user/${userId}`,
    CREATE: '/tasks',
    UPDATE: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`
  }
} as const;
