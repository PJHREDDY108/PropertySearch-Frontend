import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Register } from './register';
import { AuthService } from '../services/auth';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { routes } from '../app.routes';
import { describe, beforeEach, it, expect, vi } from 'vitest';

describe('Register Component', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let authServiceMock: { register: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    authServiceMock = {
      register: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter(routes),
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    fixture.detectChanges();
  });

  it('should validate empty inputs', () => {
    component.onRegister();
    expect(component.errorMessage).toBe('Please fill in all fields.');
  });

  it('should validate non-matching passwords', () => {
    component.username = 'user';
    component.password = 'pass1';
    component.confirmPassword = 'pass2';
    component.onRegister();
    expect(component.errorMessage).toBe('Passwords do not match.');
  });

  it('should navigate to login after successful registration', async () => {
    vi.useFakeTimers();
    authServiceMock.register.mockReturnValue(of({ username: 'user', message: 'Success' }));

    component.username = 'user';
    component.password = 'pass';
    component.confirmPassword = 'pass';
    component.onRegister();

    expect(component.successMessage).toContain('Registered successfully');
    
    vi.advanceTimersByTime(1200);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    vi.useRealTimers();
  });

  it('should set error message on registration failure', () => {
    authServiceMock.register.mockReturnValue(throwError(() => new Error('User exists')));

    component.username = 'user';
    component.password = 'pass';
    component.confirmPassword = 'pass';
    component.onRegister();

    expect(component.errorMessage).toBe('User exists');
  });
});