import { ElementRef, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortfolioRoutingModule } from './portfolio-routing.module';
import { HeaderComponent } from './static/header/header.component';
import { FooterComponent } from './static/footer/footer.component';
import { MainLayoutComponent } from './static/home-layout/home-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AbilitiesComponent } from './pages/abilities/abilities.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { ProjectsDetailsComponent } from './pages/projects-details/projects-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { LayoutComponent } from './static/layout/layout.component';
@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    MainLayoutComponent,
    HomeComponent,
    ContactComponent,
    AbilitiesComponent,
    ProjectsComponent,
    ProjectsDetailsComponent,
    LayoutComponent,
    
  ],
  imports: [
    CommonModule,
    PortfolioRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule, // Required for animations
    ToastrModule.forRoot() // Initialize Toastr globally
    
    
  ]
})
export class PortfolioModule { }
