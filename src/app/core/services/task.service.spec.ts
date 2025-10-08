import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { Task } from '../interfaces/task.interface';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse } from '../interfaces/api-response.interface';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const mockTask: Task = {
    id: 'task-123',
    userId: 'user-123',
    title: 'Test Task',
    description: 'This is a test task description',
    completed: false,
    createdAt: new Date('2025-10-07T10:00:00Z'),
    updatedAt: new Date('2025-10-07T10:00:00Z')
  };

  const mockFirestoreTask = {
    id: 'task-123',
    userId: 'user-123',
    title: 'Test Task',
    description: 'This is a test task description',
    completed: false,
    createdAt: { _seconds: 1728298800, _nanoseconds: 0 },
    updatedAt: { _seconds: 1728298800, _nanoseconds: 0 }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllTasks', () => {
    it('should fetch tasks and convert Firestore timestamps', (done) => {
      const userId = 'user-123';
      const mockResponse: ApiResponse<any[]> = {
        success: true,
        data: [mockFirestoreTask]
      };

      service.getAllTasks(userId).subscribe(tasks => {
        expect(tasks.length).toBe(1);
        expect(tasks[0].id).toBe('task-123');
        expect(tasks[0].createdAt).toBeInstanceOf(Date);
        expect(tasks[0].updatedAt).toBeInstanceOf(Date);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.TASKS.GET_BY_USER(userId)}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty tasks array', (done) => {
      const userId = 'user-123';
      const mockResponse: ApiResponse<any[]> = {
        success: true,
        data: []
      };

      service.getAllTasks(userId).subscribe(tasks => {
        expect(tasks).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.TASKS.GET_BY_USER(userId)}`);
      req.flush(mockResponse);
    });
  });

  describe('createTask', () => {
    it('should create a task and convert timestamps', (done) => {
      const newTask = {
        userId: 'user-123',
        title: 'New Task',
        description: 'New task description',
        completed: false
      };

      const mockResponse: ApiResponse<any> = {
        success: true,
        data: mockFirestoreTask
      };

      service.createTask(newTask).subscribe(task => {
        expect(task.id).toBe('task-123');
        expect(task.createdAt).toBeInstanceOf(Date);
        expect(task.updatedAt).toBeInstanceOf(Date);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.TASKS.CREATE}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newTask);
      req.flush(mockResponse);
    });
  });

  describe('updateTask', () => {
    it('should update a task and convert timestamps', (done) => {
      const taskId = 'task-123';
      const updates = {
        title: 'Updated Task',
        completed: true
      };

      const mockResponse: ApiResponse<any> = {
        success: true,
        data: { ...mockFirestoreTask, ...updates }
      };

      service.updateTask(taskId, updates).subscribe(task => {
        expect(task.title).toBe('Updated Task');
        expect(task.completed).toBe(true);
        expect(task.createdAt).toBeInstanceOf(Date);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.TASKS.UPDATE(taskId)}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);
      req.flush(mockResponse);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', (done) => {
      const taskId = 'task-123';
      const mockResponse: ApiResponse<null> = {
        success: true,
        data: null
      };

      service.deleteTask(taskId).subscribe(response => {
        expect(response).toBeUndefined();
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.TASKS.DELETE(taskId)}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('convertFirestoreTimestamp', () => {
    it('should convert Firestore timestamp to Date', () => {
      const firestoreTimestamp = { _seconds: 1728298800, _nanoseconds: 0 };
      const result = (service as any).convertFirestoreTimestamp(firestoreTimestamp);

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(1728298800000);
    });

    it('should handle regular Date objects', () => {
      const date = new Date('2025-10-07');
      const result = (service as any).convertFirestoreTimestamp(date);

      expect(result).toBeInstanceOf(Date);
    });

    it('should handle null/undefined timestamps', () => {
      expect((service as any).convertFirestoreTimestamp(null)).toBeUndefined();
      expect((service as any).convertFirestoreTimestamp(undefined)).toBeUndefined();
    });
  });
});
