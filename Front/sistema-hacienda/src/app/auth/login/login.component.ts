import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthserviceService } from '../../services/authservice.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  invalidLogin: boolean = false;

  constructor(private auth: AuthserviceService, private router: Router) { }
  onSubmit() {
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']); // o cualquier ruta protegida
      },
      error: () => {
        this.invalidLogin = true;
        this.errorMessage = 'Credenciales incorrectas';
      }
    });
  }


}
