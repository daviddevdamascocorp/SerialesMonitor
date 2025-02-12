import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SerialesComponent } from './monitor/seriales/seriales.component';

const routes: Routes = [
  { path: 'monitor', component: SerialesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
