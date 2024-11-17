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
import { LoadingComponent } from './loading/loading.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { OrderImagesComponent } from './pages/order-images/order-images.component';
import { HeaderComponent } from './static/header/header.component';
import { OrderProjectComponent } from './pages/projects/sub-component/order-project/order-project.component';

@NgModule({
  declarations: [
    LoginComponent,
    LayoutComponent,
    HomeComponent,
    AbilitiesComponent,
    ProjectsComponent,
    LoadingComponent,
    OrderImagesComponent,
    HeaderComponent,
    OrderProjectComponent,
    
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    DataTablesModule,
    DragDropModule,
    ScrollingModule
  ]
})
export class AdminModule { }
