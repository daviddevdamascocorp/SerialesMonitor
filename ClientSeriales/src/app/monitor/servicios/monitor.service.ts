import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments';
import { Productos } from '../interface/producto.interface';
import { Seriales } from '../interface/serial.interface';
import { Almacen } from '../interface/almacen.interface';
import { MovimientoSeriales } from '../interface/movseriales.interface';

@Injectable({
  providedIn: 'root'
})
export class MonitorService {

  private baseUrl = environment.baseUrl
  constructor(private httpClient:HttpClient) { }

  getAlmacenes():Observable<Almacen[]>{
    return this.httpClient.get<Almacen[]>(`${this.baseUrl}/api/seriales/almacenes`)
  }
  getProducts():Observable<Productos[]>{
    return this.httpClient.get<Productos[]>(`${this.baseUrl}/api/seriales/productos`)
  }

  getProductosSeriales(sku:String):Observable<Seriales[]>{
    return this.httpClient.get<Seriales[]>(`${this.baseUrl}/api/seriales/serialesporsku/${sku}`)
  }

  postProductosSerialesSkuSerialConocido(skuBody:any):Observable<MovimientoSeriales[]>{
    return this.httpClient.post<MovimientoSeriales[]>(`${this.baseUrl}/api/seriales/sku-serial-existente`,skuBody)
  }

  postProductosSerialesSkuAlmacen(skuBody:any):Observable<MovimientoSeriales[]>{
    return this.httpClient.post<MovimientoSeriales[]>(`${this.baseUrl}/api/seriales/sku-almacen`,skuBody)
  }
  postProductosSerialesSkuAlmacenSerial(skuBody:any):Observable<MovimientoSeriales[]>{
    return this.httpClient.post<MovimientoSeriales[]>(`${this.baseUrl}/api/seriales/sku-almacen-serial`,skuBody)
  }
}
