import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username = '';
  password = '';
  errorMessage = '';
  loading = false;
  otpMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onForgotPassword(): void {
    this.otpMessage = 'OTP has been sent to your registered email/mobile.';
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.loading = true;

    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.authService.setSession(res.username);
        this.loading = false;
        this.router.navigate(['/search']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Login failed';
      }
    });
  }
}