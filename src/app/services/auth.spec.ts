import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const createLocalStorageMock = () => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value.toString(); },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; }
    };
  };

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: createLocalStorageMock(),
      writable: true
    });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should send a register request', () => {
    const dummyResponse = { username: 'testuser', message: 'Registered successfully' };

    service.register('testuser', 'password123').subscribe(res => {
      expect(res).toEqual(dummyResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'testuser', password: 'password123' });
    req.flush(dummyResponse);
  });

  it('should handle registration error', () => {
    service.register('testuser', 'password123').subscribe({
      next: () => expect.fail('should have failed'),
      error: (err) => {
        expect(err.message).toBe('Username already exists');
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    req.flush({ message: 'Username already exists' }, { status: 409, statusText: 'Conflict' });
  });

  it('should send a login request', () => {
    const dummyResponse = { username: 'testuser', message: 'Login successful' };

    service.login('testuser', 'password123').subscribe(res => {
      expect(res).toEqual(dummyResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(dummyResponse);
  });

  it('should manage session in localStorage', () => {
    service.setSession('john');
    expect(localStorage.getItem('username')).toBe('john');
    expect(service.isLoggedIn()).toBe(true);
    expect(service.getUsername()).toBe('john');

    service.logout();
    expect(localStorage.getItem('username')).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getUsername()).toBeNull();
  });
});