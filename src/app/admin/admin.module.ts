import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { LoginComponent } from './auth/login/login.component';
import { LayoutComponent } from './static/layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { AbilitiesComponent } from './pages/abilities/abilities.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  declarations: [
    LoginComponent,
    LayoutComponent,
    HomeComponent,
    AbilitiesComponent,
    ProjectsComponent
    
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    DataTablesModule
  ]
})
export class AdminModule { }
