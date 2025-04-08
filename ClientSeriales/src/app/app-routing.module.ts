import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SerialesComponent } from './monitor/seriales/seriales.component';
import { ComponentFixture } from '@angular/core/testing';
import { AvailableMonitorComponent } from './available-serial/available-monitor/available-monitor.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: 'consulta-seriales', component: SerialesComponent },
  {path:'seriales-disponibles',component:AvailableMonitorComponent},
  {path:"inicio",component:HomeComponent},
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
