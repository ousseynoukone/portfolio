import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [

  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },

  { path: '', redirectTo: 'home', pathMatch: 'full' }, 
  { path: 'home', redirectTo: 'home', pathMatch: 'full' }, 
  
  {
    path: '404', 
    component: NotFoundComponent
  },
  {
    path: '**', 
    redirectTo: '/404',
    pathMatch: 'full'
  }
];




@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
