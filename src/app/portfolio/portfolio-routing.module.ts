import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { MainLayoutComponent } from './static/home-layout/home-layout.component';
import { ProjectsDetailsComponent } from './pages/projects-details/projects-details.component';
import { LayoutComponent } from './static/layout/layout.component';

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
        path: "project-details", 
        component: ProjectsDetailsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortfolioRoutingModule { }
