import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { LoginComponent } from './auth/login/login.component';
import { LayoutComponent } from './static/layout/layout.component';
import { HomeComponent } from './pages/home/home.component';


@NgModule({
  declarations: [
    LoginComponent,
    LayoutComponent,
    HomeComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,

  ]
})
export class AdminModule { }
