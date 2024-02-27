import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './static/layout/layout.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from '../services/guards/authGuard';

const routes: Routes = [
  {path:'admin',component:LayoutComponent, canActivate :[AuthGuard]},

  {path:'admin/login',component:LoginComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }