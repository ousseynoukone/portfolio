import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { MainLayoutComponent } from './static/home-layout/home-layout.component';
import { ProjectsDetailsComponent } from './pages/projects-details/projects-details.component';
import { LayoutComponent } from './static/layout/layout.component';
import { isRouteGuard } from '../services/guards/routeGuard';

const routes: Routes = [
  {
    path: '', 
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' }, 

      {
        path: "home", 
        component: MainLayoutComponent
      },
      {
        path: "project-details", canActivate: [isRouteGuard] ,
        component: ProjectsDetailsComponent
      }
    ]
  }
];
// ,{scrollPositionRestoration:'enabled'}
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class PortfolioRoutingModule { }
