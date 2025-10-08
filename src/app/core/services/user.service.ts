import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse } from '../interfaces/api-response.interface';
import { User } from '../interfaces/user.interface';

/**
 * Servicio para gestionar operaciones relacionadas con usuarios.
 *
 * Proporciona métodos para verificar existencia y crear usuarios.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Verifica si un usuario existe por su email.
   *
   * @param email - Email del usuario a buscar
   * @returns Observable con el usuario si existe
   * @throws Error si el usuario no existe (manejado por errorInterceptor)
   */
  public getUserByEmail(email: string): Observable<User> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}${API_ENDPOINTS.USERS.CHECK}`, { email })
      .pipe(map(response => response.data));
  }

  /**
   * Crea un nuevo usuario con el email proporcionado.
   *
   * @param email - Email del nuevo usuario
   * @returns Observable con el usuario creado
   */
  public createUser(email: string): Observable<User> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}${API_ENDPOINTS.USERS.CREATE}`, { email })
      .pipe(map(response => response.data));
  }
}
