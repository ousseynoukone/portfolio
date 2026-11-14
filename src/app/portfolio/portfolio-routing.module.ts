import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './static/home-layout/home-layout.component';
import { ProjectsDetailsComponent } from './pages/projects-details/projects-details.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, 

  { 
    path: 'home', 
    component: MainLayoutComponent 
  },
  {
    path: 'project-details/:slug',
    component: ProjectsDetailsComponent
  },
  // Ancienne URL sans slug : on renvoie vers l'accueil
  { path: 'project-details', redirectTo: 'home', pathMatch: 'full' }


];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PortfolioRoutingModule { }