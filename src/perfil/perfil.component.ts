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
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  datosUsuario: any = {
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    correo: '',
    usuario: '',
    foto: '',
    user_uid: ''
  };

  modoEdicion = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      if (usuario.user_uid) {
        this.http.get(`http://localhost:5000/api/perfil?user_uid=${usuario.user_uid}`)
          .subscribe({
            next: (data: any) => {
              this.datosUsuario = {
                nombre: data.nombre || '',
                apellidoPaterno: data.apellidoPaterno || '',
                apellidoMaterno: data.apellidoMaterno || '',
                correo: data.correo || '',
                usuario: data.usuario || '',
                foto: data.foto || '',
                user_uid: data.user_uid || ''
              };
            },
            error: (error) => {
              console.error('❌ Error al obtener perfil:', error);
            }
          });
      }
    }
  }

  toggleEdicion(): void {
    this.modoEdicion = !this.modoEdicion;
  }

  guardarCambios(): void {
    if (this.datosUsuario.user_uid) {
      // Excluye correo y usuario del PUT
      const datosActualizados = {
        nombre: this.datosUsuario.nombre,
        apellidoPaterno: this.datosUsuario.apellidoPaterno,
        apellidoMaterno: this.datosUsuario.apellidoMaterno,
        foto: this.datosUsuario.foto,
        user_uid: this.datosUsuario.user_uid
      };

      this.http.put('http://localhost:5000/api/perfil', datosActualizados).subscribe({
        next: () => {
          console.log('✅ Perfil actualizado correctamente');
          this.modoEdicion = false;
        },
        error: (err) => {
          console.error('❌ Error al guardar los cambios:', err);
        }
      });
    }
  }

  volverAlChat(): void {
    window.location.href = '/chat';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.datosUsuario.foto = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
