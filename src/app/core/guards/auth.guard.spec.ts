import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { User } from '../interfaces/user.interface';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;
  let mockUrlTree: UrlTree;

  const mockUser: User = {
    id: 'test-user-123',
    email: 'test@example.com',
    createdAt: new Date('2025-10-07')
  };

  beforeEach(() => {
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        Router
      ]
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    mockUrlTree = router.createUrlTree(['/login']);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should allow access when user is authenticated', () => {
    authService.setCurrentUser(mockUser);

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBe(true);
  });

  it('should redirect to /login when user is not authenticated', () => {
    spyOn(router, 'createUrlTree').and.returnValue(mockUrlTree);

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(mockUrlTree);
  });

  it('should use AuthService.isUserAuthenticated() to check authentication', () => {
    spyOn(authService, 'isUserAuthenticated').and.returnValue(true);

    TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(authService.isUserAuthenticated).toHaveBeenCalled();
  });
});
