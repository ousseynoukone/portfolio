import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './static/layout/layout.component';
import { LoginComponent } from './auth/login/login.component';
import { OrderImagesComponent } from './pages/order-images/order-images.component';
import { HomeComponent } from './pages/home/home.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { AbilitiesComponent } from './pages/abilities/abilities.component';
import {  isRouteGuard } from '../services/guards/routeGuard';
import { OrderProjectComponent } from './pages/projects/sub-component/order-project/order-project.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent, data: { breadcrumb: 'Dashboard' } }, 
      { path: 'projects', component: ProjectsComponent, data: { breadcrumb: 'Projets' } },
      { path: 'abilities', component: AbilitiesComponent, data: { breadcrumb: 'Compétences' } },
      // isRouteGuard
      // TO CHECK IF shareData CONTAIN A PROJECT FOR IMAGE ORDERING 
      // THIS IS NOT SUITABLE FOR OTHERS ENDPOINTS
      { path: 'order-images', component: OrderImagesComponent, data: { breadcrumb: 'Ordre des Images' }, canActivate: [isRouteGuard] },
      { path: 'order-projects', component: OrderProjectComponent, data: { breadcrumb: 'Ordre des Projets' } },
    ]
  },
  { path: 'login', component: LoginComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],

})
export class AdminRoutingModule { }