import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [CommonModule, FormsModule],
})
export class Login implements OnInit {
  email: string = '';
  password: string = '';
  loginError: boolean = false;
  loading: boolean = false;

  constructor(
    private router: Router,
    private location: Location,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const usuario = localStorage.getItem('usuario');
      if (usuario) {
        this.router.navigate(['/chat']);
      }

      // Bloquea botón de retroceso
      history.pushState(null, '', location.href);
      window.onpopstate = () => {
        history.pushState(null, '', location.href);
      };
    }
  }

  onLogin(): void {
    this.loading = true;
    this.loginError = false;

    const usuario = this.email.trim().split('@')[0];

    fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: usuario,
        password: this.password,
      }),
    })
      .then(async response => {
        this.loading = false;

        if (response.ok) {
          const res = await response.json();

          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('usuario', JSON.stringify({
              user_uid: res.user_uid,
              nombre: res.nombre || 'Sin nombre',
              apellido: res.apellido || 'Sin apellido',
              correo: this.email,
              usuario: usuario
            }));
          }

          alert('✅ Inicio de sesión exitoso');
          this.router.navigate(['/chat']);
        } else {
          const res = await response.json();
          this.loginError = true;
          console.error(res.error || 'Error de autenticación');
        }
      })
      .catch(err => {
        console.error(err);
        this.loading = false;
        this.loginError = true;
      });
  }

  goToRegistro(): void {
    this.router.navigate(['/registro']);
  }
}

