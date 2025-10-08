import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { User } from '../interfaces/user.interface';

describe('AuthService', () => {
  let service: AuthService;
  const mockUser: User = {
    id: 'test-user-123',
    email: 'test@example.com',
    createdAt: new Date('2025-10-07')
  };

  beforeEach(() => {
    // Limpiar sessionStorage antes de cada test
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setCurrentUser', () => {
    it('should set current user and save to sessionStorage', (done) => {
      service.setCurrentUser(mockUser);

      // Verificar que se guardó en sessionStorage
      const storedUser = sessionStorage.getItem('current_user');
      expect(storedUser).toBeTruthy();

      const parsedUser = JSON.parse(storedUser!);
      expect(parsedUser.id).toEqual(mockUser.id);
      expect(parsedUser.email).toEqual(mockUser.email);

      // Verificar que el observable emitió el valor
      service.currentUser$.subscribe(user => {
        expect(user?.id).toEqual(mockUser.id);
        expect(user?.email).toEqual(mockUser.email);
        done();
      });
    });

    it('should update isAuthenticated signal to true', () => {
      service.setCurrentUser(mockUser);
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when authenticated', () => {
      service.setCurrentUser(mockUser);
      const user = service.getCurrentUser();
      expect(user).toEqual(mockUser);
    });

    it('should return null when not authenticated', () => {
      const user = service.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('isUserAuthenticated', () => {
    it('should return true when user is authenticated', () => {
      service.setCurrentUser(mockUser);
      expect(service.isUserAuthenticated()).toBe(true);
    });

    it('should return false when user is not authenticated', () => {
      expect(service.isUserAuthenticated()).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear user from sessionStorage', () => {
      service.setCurrentUser(mockUser);
      expect(sessionStorage.getItem('current_user')).toBeTruthy();

      service.logout();
      expect(sessionStorage.getItem('current_user')).toBeNull();
    });

    it('should set currentUser to null', (done) => {
      service.setCurrentUser(mockUser);
      service.logout();

      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
        done();
      });
    });

    it('should update isAuthenticated signal to false', () => {
      service.setCurrentUser(mockUser);
      expect(service.isAuthenticated()).toBe(true);

      service.logout();
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('sessionStorage persistence', () => {
    it('should load user from sessionStorage on service initialization', () => {
      // Limpiar y establecer datos antes de crear el servicio
      sessionStorage.clear();
      sessionStorage.setItem('current_user', JSON.stringify(mockUser));

      // Crear nueva instancia del servicio creando un nuevo TestBed
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [AuthService]
      });

      const newService = TestBed.inject(AuthService);

      expect(newService.isUserAuthenticated()).toBe(true);
      expect(newService.isAuthenticated()).toBe(true);
    });

    it('should handle corrupted sessionStorage data gracefully', () => {
      sessionStorage.clear();
      sessionStorage.setItem('current_user', 'invalid-json-{');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [AuthService]
      });

      const newService = TestBed.inject(AuthService);

      expect(newService.isUserAuthenticated()).toBe(false);
      expect(newService.isAuthenticated()).toBe(false);
    });
  });
});
