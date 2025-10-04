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
import { FireBaseCvService } from '../services/firebaseCvService';

import { CustumCarousselComponent } from './pages/Components/custum-caroussel/custum-caroussel.component';
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
    CustumCarousselComponent,
    
  ],
  imports: [
    PortfolioRoutingModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  providers: [
    FireBaseCvService
  ]
})
export class PortfolioModule { }
