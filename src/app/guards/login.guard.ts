import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      // Si ya está logueado, redirige al chat
      this.router.navigate(['/chat']);
      return false;
    }
    return true;
  }
}
