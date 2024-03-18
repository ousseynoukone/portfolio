import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './static/layout/layout.component';
import { LoginComponent } from './auth/login/login.component';
import { OrderImagesComponent } from './pages/order-images/order-images.component';
import { HomeComponent } from './pages/home/home.component';
import { RouteGuard } from '../services/guards/routeGuard';

const routes: Routes = [
  {
    path: 'admin',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent }, // Default child route
      { path: 'order-images', component: OrderImagesComponent ,  canActivate: [RouteGuard] },
    ]
  },
  { path: 'admin/login', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers : [RouteGuard]

})
export class AdminRoutingModule { }