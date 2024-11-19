import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './static/home-layout/home-layout.component';
import { ProjectsDetailsComponent } from './pages/projects-details/projects-details.component';
import { isRouteGuard } from '../services/guards/routeGuard';

const routes: Routes = [

  { 
    path: 'home', 
    component: MainLayoutComponent 
  },
  { 
    path: 'project-details', 
    canActivate: [isRouteGuard],
    component: ProjectsDetailsComponent 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class PortfolioRoutingModule { }