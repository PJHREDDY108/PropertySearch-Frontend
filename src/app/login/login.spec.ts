import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { AuthService } from '../services/auth';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { routes } from '../app.routes';
import { describe, beforeEach, it, expect, vi } from 'vitest';

describe('Login Component', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authServiceMock: { login: ReturnType<typeof vi.fn>; setSession: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    authServiceMock = {
      login: vi.fn(),
      setSession: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter(routes),
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    fixture.detectChanges();
  });

  it('should set otpMessage on forgot password click', () => {
    component.onForgotPassword();
    expect(component.otpMessage).toContain('OTP has been sent');
  });

  it('should navigate to search on successful login', () => {
    authServiceMock.login.mockReturnValue(of({ username: 'john', message: 'Success' }));
    
    component.username = 'john';
    component.password = 'password';
    component.onSubmit();

    expect(authServiceMock.setSession).toHaveBeenCalledWith('john');
    expect(router.navigate).toHaveBeenCalledWith(['/search']);
    expect(component.loading).toBe(false);
  });

  it('should display error on failed login', () => {
    authServiceMock.login.mockReturnValue(throwError(() => new Error('Invalid credentials')));

    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid credentials');
    expect(component.loading).toBe(false);
  });
});