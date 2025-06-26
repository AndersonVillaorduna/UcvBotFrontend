import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async obtenerPerfil(): Promise<any> {
    if (isPlatformBrowser(this.platformId)) {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      if (!usuario.user_uid) return null;

      const response = await this.http.get(
        `http://localhost:5000/api/perfil?user_uid=${usuario.user_uid}`
      ).toPromise();

      return response;
    } else {
      // SSR: evita usar localStorage
      return null;
    }
  }
}
