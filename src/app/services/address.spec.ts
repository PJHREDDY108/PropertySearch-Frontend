import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AddressService } from './address';
import { PropertyAddress } from '../models/property-address';
import { environment } from '../../environments/environment';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';

describe('AddressService', () => {
  let service: AddressService;
  let httpMock: HttpTestingController;

  const mockAddress: PropertyAddress = {
    id: 1,
    street: '123 Main St',
    city: 'Chennai',
    state: 'TN',
    zip: '600001',
    propertyType: 'Apartment',
    price: 500000,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1100
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AddressService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AddressService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should fetch search results with query parameters', () => {
    service.search('Main', 'Chennai', '600001').subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0]).toEqual(mockAddress);
    });

    const req = httpMock.expectOne(req => 
      req.url === `${environment.apiUrl}/addresses/search` &&
      req.params.get('street') === 'Main' &&
      req.params.get('city') === 'Chennai' &&
      req.params.get('zip') === '600001'
    );

    expect(req.request.method).toBe('GET');
    req.flush([mockAddress]);
  });

  it('should create a new address', () => {
    service.create(mockAddress).subscribe(res => {
      expect(res).toEqual(mockAddress);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/addresses`);
    expect(req.request.method).toBe('POST');
    req.flush(mockAddress);
  });

  it('should update an address', () => {
    service.update(1, mockAddress).subscribe(res => {
      expect(res).toEqual(mockAddress);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/addresses/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockAddress);
  });

  it('should delete an address', () => {
    service.delete(1).subscribe(res => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/addresses/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});