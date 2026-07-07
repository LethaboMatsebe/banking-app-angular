import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'Core Banking Gateway Shell';

  constructor(private router: Router) {}

  // This will handle view changes through the routing framework seamlessly
  handleLoginSuccess(role: string) {
    this.router.navigate(['/dashboard']);
  }

  handleLogout() {
    this.router.navigate(['/auth']);
  }
}
