import { Routes } from '@angular/router';
import { Login } from '../login/login';
import { Registro } from '../registro/registro';
import { Chat } from '../chat/chat';
import { PerfilComponent } from '../perfil/perfil.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';


export const routes: Routes = [
  { path: '', component: Login },
  { path: 'registro', component: Registro },
  { path: 'chat', component: Chat },
{ path: 'perfil', component: PerfilComponent },
  { path: 'chat', component: Chat, canActivate: [AuthGuard] },
  { path: '', component: Login, canActivate: [LoginGuard] },

  { path: '**', redirectTo: '' }
];
