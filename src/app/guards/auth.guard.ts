import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    if (typeof window !== 'undefined') {
      const usuario = localStorage.getItem('usuario');
      if (usuario) {
        return true;
      } else {
        alert('⚠️ Usuario no autenticado');
        this.router.navigate(['/login']);
        return false;
      }
    }

    // Si no es entorno de navegador, denegar
    return false;
  }
}
