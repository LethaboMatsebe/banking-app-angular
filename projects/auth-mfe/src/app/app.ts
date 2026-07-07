import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BankingService, UserAccount } from '../../../shell/src/app/banking.service';

@Component({
  selector: 'app-auth-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  isLoginView = false;

  // Create the forms and control arrays
  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    role: new FormControl<'user' | 'manager' | 'admin'>('user', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  constructor(private bankingService: BankingService, private router: Router) {}

  // Handle the registration logic
  onRegisterSubmit() {
    if (this.registerForm.valid) {
      const data = this.registerForm.value;
      if (this.bankingService.isEmailRegistered(data.email!)) {
        alert('This email is already registered!');
        return;
      }
      this.bankingService.registerUser({
        username: data.username!,
        email: data.email!,
        role: data.role!,
        password: data.password!,
        balance: 0
      });
      alert('Registration Successful! Switching to Login view.');
      this.isLoginView = true;
    }
  }

  // Handle the login authentication and router redirect
  onLoginSubmit() {
    if (this.loginForm.valid) {
      const { email } = this.loginForm.value;
      const user = this.bankingService.getUsers().find((u: UserAccount) => u.email === email);

      if (user) {
        this.bankingService.setCurrentUser(user);

        // This navigates seamlessly over to your dashboard-mfe layout
        this.router.navigate(['/dashboard']);
      } else {
        alert('User validation credentials failed or profile missing!');
      }
    }
  }
}
