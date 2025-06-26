import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IaService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // ✅ Genera encabezados JSON
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // ✅ Enviar pregunta a la IA
  enviarPregunta(pregunta: string, user_uid: string, session_id: string): Observable<any> {
    const payload = { prompt: pregunta, user_uid, session_id };
    return this.http.post<any>(`${this.baseUrl}/pregunta`, payload, {
      headers: this.getHeaders()
    });
  }

  // ✅ Crear nueva sesión de chat
  crearSesion(data: { session_id: string; student_id: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/sesion`, data, {
      headers: this.getHeaders()
    });
  }

  // ✅ Obtener historial de mensajes
  obtenerMensajes(session_id: string, user_uid: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/historial/${session_id}/${user_uid}`);
  }

  // ✅ Obtener sesiones del estudiante
  obtenerSesiones(student_id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sesiones/${student_id}`);
  }

  // ✅ Guardar puntaje (nivel)
  guardarNivel(data: { puntaje: number; student_id: string; nombre: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/nivel`, data, {
      headers: this.getHeaders()
    });
  }

  // ✅ Generar examen a partir del historial
  generarPreguntasExamen(mensajes: string[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/generar_preguntas`, { mensajes }, {
      headers: this.getHeaders()
    });
  }

  // ✅ Cargar preguntas desde la API (v_content)
  cargarPreguntas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/CargarPreguntas`);
  }
}
