import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertySearch } from './property-search';
import { AddressService } from '../services/address';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PropertyAddress } from '../models/property-address';
import { provideRouter } from '@angular/router';
import { describe, beforeEach, it, expect, vi } from 'vitest';

describe('PropertySearch Component', () => {
  let component: PropertySearch;
  let fixture: ComponentFixture<PropertySearch>;
  let addressServiceMock: { search: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let authServiceMock: { logout: ReturnType<typeof vi.fn>; getUsername: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  const mockAddress: PropertyAddress = {
    id: 1,
    street: '123 Main St',
    city: 'Chennai',
    state: 'TN',
    zip: '600001',
    propertyType: 'Villa',
    price: 1000000,
    bedrooms: 3,
    bathrooms: 3,
    squareFeet: 2000
  };

  beforeEach(async () => {
    addressServiceMock = {
      search: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };
    authServiceMock = {
      logout: vi.fn(),
      getUsername: vi.fn()
    };
    routerMock = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [PropertySearch],
      providers: [
        provideRouter([]),
        { provide: AddressService, useValue: addressServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PropertySearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should execute search and store results', () => {
    addressServiceMock.search.mockReturnValue(of([mockAddress]));

    component.onSearch();

    expect(component.results.length).toBe(1);
    expect(component.results[0]).toEqual(mockAddress);
    expect(component.searched).toBe(true);
  });

  it('should handle search errors cleanly', () => {
    addressServiceMock.search.mockReturnValue(throwError(() => new Error('Server error')));

    component.onSearch();

    expect(component.errorMessage).toContain('Could not reach the server');
  });

  it('should open new address form on onCreateNew', () => {
    component.onCreateNew();
    expect(component.showForm).toBe(true);
    expect(component.editingId).toBeNull();
  });

  it('should populate form on edit', () => {
    component.onEdit(mockAddress);
    expect(component.showForm).toBe(true);
    expect(component.editingId).toBe(1);
    expect(component.formModel.street).toBe('123 Main St');
  });

  it('should call create service on save when editingId is null', () => {
    addressServiceMock.create.mockReturnValue(of(mockAddress));
    addressServiceMock.search.mockReturnValue(of([]));

    component.onCreateNew();
    component.onSaveForm();

    expect(addressServiceMock.create).toHaveBeenCalled();
  });

  it('should call update service on save when editingId is set', () => {
    addressServiceMock.update.mockReturnValue(of(mockAddress));
    addressServiceMock.search.mockReturnValue(of([]));

    component.onEdit(mockAddress);
    component.onSaveForm();

    expect(addressServiceMock.update).toHaveBeenCalledWith(1, expect.any(Object));
  });

  it('should delete address after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    addressServiceMock.delete.mockReturnValue(of(undefined));
    component.results = [mockAddress];

    component.onDelete(mockAddress);

    expect(addressServiceMock.delete).toHaveBeenCalledWith(1);
    expect(component.results.length).toBe(0);
  });
});