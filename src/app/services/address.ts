import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PropertyAddress } from '../models/property-address';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AddressService {

  private readonly apiUrl = `${environment.apiUrl}/addresses`;

  constructor(private http: HttpClient) {}

  search(street: string, city: string, zip: string): Observable<PropertyAddress[]> {
    const params = new HttpParams()
      .set('street', street ?? '')
      .set('city', city ?? '')
      .set('zip', zip ?? '');

    return this.http.get<PropertyAddress[]>(`${this.apiUrl}/search`, { params });
  }

  getAll(): Observable<PropertyAddress[]> {
    return this.http.get<PropertyAddress[]>(this.apiUrl);
  }

  create(address: PropertyAddress): Observable<PropertyAddress> {
    return this.http.post<PropertyAddress>(this.apiUrl, address);
  }

  update(id: number, address: PropertyAddress): Observable<PropertyAddress> {
    return this.http.put<PropertyAddress>(`${this.apiUrl}/${id}`, address);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}