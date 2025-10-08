import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse } from '../interfaces/api-response.interface';
import { CreateTaskDTO, Task, UpdateTaskDTO } from '../interfaces/task.interface';

/**
 * Servicio para gestionar operaciones CRUD de tareas.
 *
 * Maneja la comunicación con el API backend y transforma
 * automáticamente los timestamps de Firestore a objetos Date de JavaScript.
 */
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Convierte un Timestamp de Firestore a objeto Date de JavaScript.
   *
   * @param timestamp - Timestamp en formato Firestore {_seconds, _nanoseconds} o ISO string
   * @returns Objeto Date o undefined si el timestamp es inválido
   */
  private convertFirestoreTimestamp(timestamp: any): Date | undefined {
    if (!timestamp) return undefined;
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000);
    }
    return new Date(timestamp);
  }

  /**
   * Normaliza una tarea del backend convirtiendo sus timestamps.
   *
   * @param task - Tarea con timestamps en formato Firestore
   * @returns Tarea con timestamps convertidos a Date
   */
  private normalizeTask(task: any): Task {
    return {
      ...task,
      createdAt: this.convertFirestoreTimestamp(task.createdAt),
      updatedAt: this.convertFirestoreTimestamp(task.updatedAt)
    };
  }

  /**
   * Obtiene todas las tareas de un usuario específico.
   *
   * @param userId - ID del usuario
   * @returns Observable con array de tareas normalizadas
   */
  public getAllTasks(userId: string): Observable<Task[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}${API_ENDPOINTS.TASKS.GET_BY_USER(userId)}`)
      .pipe(map(response => response.data.map(task => this.normalizeTask(task))));
  }

  /**
   * Crea una nueva tarea.
   *
   * @param task - Datos de la tarea a crear
   * @returns Observable con la tarea creada y normalizada
   */
  public createTask(task: CreateTaskDTO): Observable<Task> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}${API_ENDPOINTS.TASKS.CREATE}`, task)
      .pipe(map(response => this.normalizeTask(response.data)));
  }

  /**
   * Actualiza una tarea existente.
   *
   * @param id - ID de la tarea a actualizar
   * @param task - Datos parciales a actualizar
   * @returns Observable con la tarea actualizada y normalizada
   */
  public updateTask(id: string, task: UpdateTaskDTO): Observable<Task> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}${API_ENDPOINTS.TASKS.UPDATE(id)}`, task)
      .pipe(map(response => this.normalizeTask(response.data)));
  }

  /**
   * Elimina una tarea por su ID.
   *
   * @param id - ID de la tarea a eliminar
   * @returns Observable que completa cuando la eliminación es exitosa
   */
  public deleteTask(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}${API_ENDPOINTS.TASKS.DELETE(id)}`)
      .pipe(map(() => undefined));
  }
}
