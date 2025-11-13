import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { MainComponent } from './main/main.component';
import { AuthGuardService } from './core-services/auth-guard.service';

const routes: Routes = [
  {path: "",pathMatch: "full",redirectTo: "login"},
  {path:'login',component:AuthComponent}, 
  {
    path: 'main',component: MainComponent,canActivate: [AuthGuardService],
    loadChildren: () => import('./main/main.module').then(m => m.MainModule)
  }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
