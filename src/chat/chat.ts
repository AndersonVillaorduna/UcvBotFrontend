import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { UsuarioService } from '../app/services/usuario.service';
import { IaService } from '../app/services/ia.service';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss']
})
export class Chat implements OnInit {
  usuario: any;
  nombreUsuario: string = '';
  iniciales: string = 'US';
  mostrarMenu: boolean = false;
  respuestaIA: string = '';
  nuevaPregunta: string = '';
  mensajes: { de: 'usuario' | 'bot', texto: string }[] = [];

  sessionId: string = '';
  sesiones: { session_id: string, ultima_fecha: string }[] = [];

  mensajeFinal: string = '';
  mostrarBotonExamen: boolean = false;
  mostrarModalExamen: boolean = false;
  tiempoRestante: number = 300;
  intervaloTiempo: any;
  preguntas: string[] = [];

  examenPreguntas: { texto: string, opciones: string[], correcta?: string, respuestaSeleccionada?: string }[] = Array.from({ length: 20 }, (_, i) => ({
    texto: `Pregunta ${i + 1}: Escribe tu respuesta`,
    opciones: ["Opción A", "Opción B", "Opción C", "Opción D"],
    respuestaSeleccionada: ''
  }));

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private iaService: IaService,
    private location: Location
  ) {}

  async ngOnInit() {
    // Bloquear botón "atrás" solo en navegador
    if (typeof window !== 'undefined') {
      history.pushState(null, '', location.href);
      window.onpopstate = () => {
        history.pushState(null, '', location.href);
      };
    }

    this.usuario = await this.usuarioService.obtenerPerfil();

    if (this.usuario) {
      this.nombreUsuario = `${this.usuario.nombre || ''} ${this.usuario.apellidoPaterno || ''} ${this.usuario.apellidoMaterno || ''}`.trim();
      const nombres = this.nombreUsuario.split(' ');
      this.iniciales = nombres.map(n => n[0]).join('').substring(0, 2).toUpperCase();

      if (typeof window !== 'undefined') {
        const sessionGuardada = localStorage.getItem('session_id');
        if (sessionGuardada) {
          this.sessionId = sessionGuardada;
          this.cargarHistorial();
        } else {
          this.nuevoChat();
        }
      }
      this.cargarPreguntas();
      this.cargarSesionesAnteriores();
    }
  }

  toggleMenu(): void {
    this.mostrarMenu = !this.mostrarMenu;
  }

  irPerfil(): void {
    this.mostrarMenu = false;
    this.router.navigate(['/perfil']);
  }

  cerrarSesion(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('usuario');
      localStorage.removeItem('session_id');
    }
    this.router.navigate(['/login']);
  }

  generarSessionId(): string {
    return crypto.randomUUID();
  }

  crearSesionEnBD(session_id: string): void {
    if (!this.usuario?.user_uid || !session_id) return;

    this.iaService.crearSesion({ session_id, student_id: this.usuario.user_uid }).subscribe({
      next: (res) => console.log('✅ Sesión creada:', res),
      error: (err) => console.error('❌ Error al crear sesión:', err)
    });
  }

  nuevoChat() {
    this.sessionId = this.generarSessionId();
    if (typeof window !== 'undefined') {
      localStorage.setItem('session_id', this.sessionId);
    }
    this.crearSesionEnBD(this.sessionId);
    this.mensajes = [];
    this.nuevaPregunta = '';
  }

  cargarHistorial(): void {
    this.iaService.obtenerMensajes(this.sessionId, this.usuario.user_uid).subscribe({
      next: (res) => {
        this.mensajes = res;
      },
      error: (err) => {
        console.error('❌ Error al cargar historial:', err);
        this.mensajes = [];
      }
    });
  }

  cargarSesionesAnteriores(): void {
    if (!this.usuario?.user_uid) return;

    this.iaService.obtenerSesiones(this.usuario.user_uid).subscribe({
      next: (res) => {
        this.sesiones = res;
      },
      error: (err) => {
        console.error("❌ Error cargando sesiones:", err);
      }
    });
  }

  cargarSesion(session_id: string): void {
    this.sessionId = session_id;
    if (typeof window !== 'undefined') {
      localStorage.setItem('session_id', session_id);
    }
    this.cargarHistorial();
  }

  async enviarPreguntaIA(pregunta: string): Promise<void> {
    if (!this.usuario?.user_uid || !this.sessionId) return;

    try {
      const resultado = await this.iaService
        .enviarPregunta(`${pregunta}`, this.usuario.user_uid, this.sessionId)
        .toPromise();

      this.respuestaIA = resultado.respuesta || 'Sin respuesta';
      this.mensajes.push({ de: 'usuario', texto: pregunta });
      this.mensajes.push({ de: 'bot', texto: this.respuestaIA });
      this.nuevaPregunta = '';

      const totalUsuario = this.mensajes.filter(m => m.de === 'usuario').length;
      if (totalUsuario >= 3 && !this.mostrarModalExamen && !this.mostrarBotonExamen) {
        this.mostrarBotonExamen = true;
      }

    } catch (error) {
      console.error('❌ Error al contactar con la IA:', error);
    }
  }

  abrirExamen(): void {
    const mensajesUsuario = this.mensajes
      .filter(m => m.de === 'usuario')
      .map(m => `${m.texto}`);

    this.iaService.generarPreguntasExamen(mensajesUsuario).subscribe({
      next: (preguntasGeneradas) => {
        if (!Array.isArray(preguntasGeneradas)) {
          console.error("❌ El backend no devolvió una lista válida de preguntas.");
          return;
        }

        this.examenPreguntas = preguntasGeneradas.map(p => ({
          texto: p.texto,
          opciones: p.opciones,
          correcta: p.correcta,
          respuestaSeleccionada: ''
        }));

        this.mostrarModalExamen = true;
        this.tiempoRestante = 300;
        this.iniciarTemporizador();
      },
      error: (err) => {
        console.error("❌ Error al generar preguntas con IA:", err);
      }
    });
  }

  iniciarTemporizador(): void {
    this.intervaloTiempo = setInterval(() => {
      if (this.tiempoRestante > 0) {
        this.tiempoRestante--;
      } else {
        clearInterval(this.intervaloTiempo);
        this.enviarExamen();
      }
    }, 1000);
  }

  cerrarExamen(): void {
    clearInterval(this.intervaloTiempo);
    this.mostrarModalExamen = false;
  }

  enviarExamen(): void {
    clearInterval(this.intervaloTiempo);

    const respuestasCorrectas = this.examenPreguntas.filter(p => p.respuestaSeleccionada === p.correcta).length;
    const puntaje = (respuestasCorrectas / this.examenPreguntas.length) * 100;

    this.iaService.guardarNivel({
      puntaje: puntaje,
      student_id: this.usuario?.user_uid,
      nombre: this.nombreUsuario
    }).subscribe({
      next: () => console.log("✅ Nivel guardado en base de datos"),
      error: (err) => console.error("❌ Error al guardar nivel:", err)
    });

    this.mensajeFinal = puntaje < 70
      ? "Sigue estudiando, ¡tú puedes mejorar!"
      : "¡Felicidades! Has aprobado.";

    this.mostrarModalExamen = false;
    this.mostrarBotonExamen = false;

    alert(this.mensajeFinal);
  }

  cargarPreguntas(){
    this.iaService.cargarPreguntas()
    .subscribe({
      next: (preguntas: string[]) => {
        this.preguntas = preguntas;
        console.log("✅ Preguntas cargadas")
      },
      error: (err) => console.error("❌ Error al cargar preguntas:", err)
    });
  }

}
