import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../interfaces/user.interface';

/**
 * Servicio de autenticación que gestiona el estado del usuario autenticado.
 *
 * Utiliza sessionStorage para persistir la sesión durante la navegación,
 * ofreciendo un balance entre seguridad y experiencia de usuario.
 * La sesión se elimina automáticamente al cerrar el navegador.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly SESSION_KEY = 'current_user';
  private readonly currentUserSubject = new BehaviorSubject<User | null>(this.loadUserFromSession());
  public readonly currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  public readonly isAuthenticated = signal<boolean>(this.loadUserFromSession() !== null);

  /**
   * Carga el usuario desde sessionStorage si existe.
   * @returns Usuario deserializado o null si no existe o es inválido
   */
  private loadUserFromSession(): User | null {
    const userJson = sessionStorage.getItem(this.SESSION_KEY);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  /**
   * Establece el usuario actual y actualiza el estado de autenticación.
   * Guarda el usuario en sessionStorage para persistencia.
   *
   * @param user - Usuario a autenticar
   */
  public setCurrentUser(user: User): void {
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticated.set(true);
  }

  /**
   * Obtiene el usuario actualmente autenticado.
   * @returns Usuario actual o null si no hay usuario autenticado
   */
  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Cierra la sesión del usuario actual.
   * Elimina los datos de sessionStorage y resetea el estado.
   */
  public logout(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
  }

  /**
   * Verifica si existe un usuario autenticado.
   * @returns true si hay un usuario autenticado, false en caso contrario
   */
  public isUserAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
