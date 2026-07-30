import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AddressService } from '../services/address';
import { AuthService } from '../services/auth';
import { PropertyAddress } from '../models/property-address';

const EMPTY_FORM: PropertyAddress = {
  street: '',
  city: '',
  state: '',
  zip: '',
  propertyType: '',
  price: 0,
  bedrooms: 0,
  bathrooms: 0,
  squareFeet: 0
};

@Component({
  selector: 'app-property-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-search.html',
  styleUrl: './property-search.css'
})
export class PropertySearch {
  street = '';
  city = '';
  zip = '';

  results: PropertyAddress[] = [];
  searched = false;
  loading = false;
  errorMessage = '';

  showForm = false;
  editingId: number | null = null;
  formModel: PropertyAddress = { ...EMPTY_FORM };

  constructor(
    private addressService: AddressService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSearch(): void {
    this.loading = true;
    this.searched = true;
    this.errorMessage = '';

    this.addressService.search(this.street, this.city, this.zip).subscribe({
      next: (res) => {
        this.results = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Could not reach the server. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onCreateNew(): void {
    this.editingId = null;
    this.formModel = { ...EMPTY_FORM };
    this.showForm = true;
  }

  onEdit(address: PropertyAddress): void {
    this.editingId = address.id ?? null;
    this.formModel = { ...address };
    this.showForm = true;
  }

  onCancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.formModel = { ...EMPTY_FORM };
  }

  onSaveForm(): void {
    this.errorMessage = '';

    const save$ = this.editingId != null
      ? this.addressService.update(this.editingId, this.formModel)
      : this.addressService.create(this.formModel);

    save$.subscribe({
      next: () => {
        this.showForm = false;
        this.editingId = null;
        this.formModel = { ...EMPTY_FORM };
        this.onSearch();
      },
      error: () => {
        this.errorMessage = 'Could not save the address. Please check the fields and try again.';
        this.cdr.detectChanges();
      }
    });
  }

  onDelete(address: PropertyAddress): void {
    if (address.id == null) return;
    if (!confirm(`Delete ${address.street}, ${address.city}?`)) return;

    this.addressService.delete(address.id).subscribe({
      next: () => {
        this.results = this.results.filter(r => r.id !== address.id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Could not delete the address. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }
}