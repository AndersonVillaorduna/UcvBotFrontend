import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.scss']
})
export class Registro {
  username: string = '';
  apellidoPaterno: string = '';
  apellidoMaterno: string = '';
  carrera: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  registroError: string = '';

  constructor(private router: Router) {}

  onSubmit(): void {
    if (this.password !== this.confirmPassword) {
      this.registroError = 'Las contraseñas no coinciden.';
      return;
    }

    if (!this.email.endsWith('@ucvvirtual.edu.pe')) {
      this.registroError = 'El correo debe ser institucional (@ucvvirtual.edu.pe).';
      return;
    }

    const data = {
      username: this.username,
      apellidoPaterno: this.apellidoPaterno,
      apellidoMaterno: this.apellidoMaterno,
      carrera: this.carrera,
      email: this.email,
      password: this.password
    };

    fetch('http://localhost:5000/api/registro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(async response => {
      if (response.ok) {
        const json = await response.json();
        alert('Registro exitoso!');
        this.router.navigate(['/login']);
      } else {
        const error = await response.json();
        this.registroError = error.error || 'Error en el registro.';
      }
    })
    .catch(err => {
      console.error(err);
      this.registroError = 'No se pudo conectar con el servidor.';
    });
  }

  goTologin(): void {
    this.router.navigate(['/login']);
  }
}
