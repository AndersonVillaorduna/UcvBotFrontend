import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  datosUsuario: any = {
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    correo: '',
    foto: '',
    usuario: '',
    user_uid: '',
  };

  modoEdicion = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const usuarioRaw = localStorage.getItem('usuario');
      console.log('🧠 LocalStorage -> usuario:', usuarioRaw);

      const usuario = JSON.parse(usuarioRaw || '{}');

      if (usuario.user_uid) {
        const url = `https://ucvbotbackend.onrender.com/api/perfil?user_uid=${usuario.user_uid}`;
        console.log('📡 Realizando petición GET a:', url);

        this.http.get(url).subscribe({
          next: (data: any) => {
            console.log('🧾 Datos recibidos del backend:', data);

            this.datosUsuario = {
              nombre: data.nombre || '',
              apellidoPaterno: data.apellidoPaterno || '',
              apellidoMaterno: data.apellidoMaterno || '',
              correo: data.correo || '',
              foto: data.foto || '',
              usuario: data.usuario || '',
              user_uid: usuario.user_uid || '',
            };

            console.log('✅ datosUsuario final:', this.datosUsuario);
          },
          error: (error) => {
            console.error('❌ Error al obtener perfil:', error);
          },
        });
      } else {
        console.warn('⚠️ No se encontró user_uid en localStorage');
      }
    }
  }

  toggleEdicion(): void {
    this.modoEdicion = !this.modoEdicion;
    console.log(`✏️ Modo edición: ${this.modoEdicion}`);
  }

  guardarCambios(): void {
    if (this.datosUsuario.user_uid) {
      const datosActualizados = {
        nombre: this.datosUsuario.nombre,
        apellidoPaterno: this.datosUsuario.apellidoPaterno,
        apellidoMaterno: this.datosUsuario.apellidoMaterno,
        foto: this.datosUsuario.foto,
        user_uid: this.datosUsuario.user_uid,
      };

      console.log('📤 Enviando PUT con:', datosActualizados);

      this.http
        .put('https://ucvbotbackend.onrender.com/api/perfil', datosActualizados)
        .subscribe({
          next: () => {
            console.log('✅ Perfil actualizado correctamente');
            this.modoEdicion = false;
          },
          error: (err) => {
            console.error('❌ Error al guardar los cambios:', err);
          },
        });
    } else {
      console.warn('⚠️ No se puede guardar: user_uid ausente');
    }
  }

  volverAlChat(): void {
    console.log('↩️ Navegando de vuelta al chat...');
    window.location.href = '/chat';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      console.log('📷 Imagen seleccionada:', file.name);
      const reader = new FileReader();
      reader.onload = () => {
        this.datosUsuario.foto = reader.result as string;
        console.log('🖼 Base64 cargado en foto:', this.datosUsuario.foto.substring(0, 30) + '...');
      };
      reader.readAsDataURL(file);
    } else {
      console.warn('📭 No se seleccionó ningún archivo');
    }
  }
}
