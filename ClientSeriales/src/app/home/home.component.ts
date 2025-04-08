import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  public HomeListContents = [
   
   
    {label:'Movimientos de seriales', icon:'history', url:'/consulta-seriales'},
    {label:'Seriales disponibles', icon:'new_releases', url:'/seriales-disponibles'},
 
  ]
}
