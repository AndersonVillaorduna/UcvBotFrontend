import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async obtenerPerfil(): Promise<any> {
    if (isPlatformBrowser(this.platformId)) {
      const usuarioRaw = localStorage.getItem('usuario');
      console.log('📥 usuario.service.ts -> localStorage:', usuarioRaw);
      const usuario = JSON.parse(usuarioRaw || '{}');
      return usuario.user_uid ? usuario : null;
    }
    console.warn('⚠️ Intento de acceder a localStorage en entorno no navegador');
    return null;
  }
}
