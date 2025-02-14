import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SerialesComponent } from './monitor/seriales/seriales.component';

const routes: Routes = [
  { path: 'consulta-seriales', component: SerialesComponent },
  {
    path: '',
    redirectTo: 'consulta-seriales',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
