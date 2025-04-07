import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../enviroments';
import { Observable } from 'rxjs';
import { Serial } from './serial.interface';

@Injectable({
  providedIn: 'root'
})
export class SerialesService {

   private baseUrl = environment.baseUrl
    constructor(private httpClient:HttpClient) { }

    ConsultaSerialesDisponibles(skuBody:any):Observable<Serial[]>{
      return this.httpClient.post<Serial[]>(`${this.baseUrl}/api/seriales/seriales-disponibles`,skuBody)
    }
}
