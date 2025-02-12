import { Component, OnInit, ViewChild } from '@angular/core';
import { Seriales } from '../interface/serial.interface';
import { Productos } from '../interface/producto.interface';
import { Almacen } from '../interface/almacen.interface';
import { MovimientoSeriales } from '../interface/movseriales.interface';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MyErrorStateMatcher } from '../../matcher';
import { MonitorService } from '../servicios/monitor.service';
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, startWith, switchMap } from 'rxjs';
import { group } from '@angular/animations';
import { LoaderService } from '../../../loader/loader.service';

export const _filter = (opt: string[], value: string): string[] => {
  const filterValue = value.toLowerCase();

  return opt.filter(item => item.toLowerCase().includes(filterValue));
};

@Component({
  selector: 'app-seriales',
  templateUrl: './seriales.component.html',
  styleUrl: './seriales.component.css'
})

export class SerialesComponent implements OnInit {
  public seriales!:Seriales[]
  public productos!:Productos[]
  public almacenes!:Almacen[]
  serialesGroupOption!:Observable<Seriales[]> | undefined
  productosGroupOption:Observable<Productos[]> | undefined
  almacenesGroupOption!:Observable<Almacen[]> | undefined
  public TablaSeriales!:MatTableDataSource<MovimientoSeriales>
  public displayedColumns: string[] = [ "dateSerial","serialNumber", "productSku","productName","numberMovement", 
    "warehouseId",  "warehouseName", "typeMovement"]
  matcher = new MyErrorStateMatcher();
  
  formSeriales : FormGroup;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator | any;
  constructor(public monitorService:MonitorService,private formBuilder: FormBuilder, private loaderService:LoaderService) {

    this.formSeriales = this.formBuilder.group({
      sku: [''],
      serial: [''],
      almacen: [''],
     
   
    });
  
  }
  ngOnInit(): void {
   
    
     this.productosGroupOption = this.formSeriales.get('sku')?.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(val=> {return this._filterProduct(val || '')}),
      catchError(err => {
        console.error('Error fetching data:', err);
        return of([]); // Return an empty array in case of an error
      })    )

      this.almacenesGroupOption = this.formSeriales.get('almacen')?.valueChanges.pipe(
        startWith(''),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap(val=> {return this._filterAlmacen(val || '')}),
        catchError(err => {
          console.error('Error fetching data:', err);
          return of([]); // Return an empty array in case of an error
        })    )

        this.serialesGroupOption = this.formSeriales.get('serial')?.valueChanges.pipe(

          startWith(''),
          debounceTime(200),
        distinctUntilChanged(),
        switchMap(val=> {return this._filtrarSeriales(val || '')}),
        catchError(err => {
          console.error('Error fetching data:', err);
          return of([]); // Return an empty array in case of an error
        }) 
        )
  }

  filterProduct(){
    this.productosGroupOption = this._filterProduct( this.formSeriales.get('sku')?.value)
  }

  
  filterAlmacen(){   this.almacenesGroupOption = this._filterAlmacen( this.formSeriales.get('almacen')?.value)}
  filterSerial(){this.serialesGroupOption = this._filtrarSeriales(this.formSeriales.get('serial')?.value)}
  _filterProduct(val:string):Observable<Productos[]>{
    return this.monitorService.getProducts().pipe(
      map(response => response.filter(prodOpt=>{
        let skuID = prodOpt.productSku.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) ===0
        let nameSku = prodOpt.productName.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) ===0
        return skuID || nameSku
      })),
      catchError(err => {
        console.error('Error fetching productos:', err);
        return of([]); // Return an empty array as a default
      })
    )
  }

  _filterAlmacen(val:string):Observable<Almacen[]>{
    return this.monitorService.getAlmacenes().pipe(
      map(response => response.filter(almOpt=>{
        return almOpt.whsName.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) ===0
      })),
      catchError(err => {
        console.error('Error fetching productos:', err);
        return of([]); // Return an empty array as a default
      })
    )
  } 

  _filtrarSeriales(val:string):Observable<Seriales[]>{
    let sku = this.formSeriales.get('sku')?.value
    console.log("hi"+sku)
    return   this.monitorService.getProductosSeriales(sku).pipe(   map(response => response.filter(almOpt=>{
      return almOpt.productSerial.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) ===0
    })),
    catchError(err => {
      console.error('Error fetching productos:', err);
      return of([]); // Return an empty array as a default
    }))

  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.TablaSeriales.filter = filterValue.trim().toLowerCase();
    if (this.TablaSeriales.paginator) {
      this.TablaSeriales.paginator.firstPage();
    }
  }
  SelectSeriales(event:any){
    this.monitorService.getProductosSeriales(event.value).subscribe(results=>{
     results = this.seriales
    })
  }
  cleanForm(){
    this.formSeriales.reset()
   }
  submitForm(){
 
    const { sku, serial, almacen } = this.formSeriales.value;

    if(sku && serial){
      this.loaderService.loadingOn()
      let data = {
        sku:sku,
        serial:serial
      }
     
      this.monitorService.postProductosSerialesSkuSerialConocido(data).subscribe(results=>{
        this.TablaSeriales = new MatTableDataSource(results)
        this.TablaSeriales.paginator = this.paginator
        this.TablaSeriales.sort = this.sort
        this.loaderService.loadingOff()
      })
    }else if(sku && serial && almacen){
      this.loaderService.loadingOn()
      let data = {
        sku:sku,
        serial:serial,
        almacen:almacen
      }
      this.monitorService.postProductosSerialesSkuAlmacenSerial(data).subscribe(results=>{
        this.TablaSeriales = new MatTableDataSource(results)
        this.TablaSeriales.paginator = this.paginator
        this.TablaSeriales.sort = this.sort
        this.loaderService.loadingOff()
      })
  
    }else if (sku && almacen){
      this.loaderService.loadingOn()
      let data = {
        sku:sku,
       
        almacen:almacen
      }
      this.monitorService.postProductosSerialesSkuAlmacen(data).subscribe(results=>{
        this.TablaSeriales = new MatTableDataSource(results)
        this.TablaSeriales.paginator = this.paginator
        this.TablaSeriales.sort = this.sort
        this.loaderService.loadingOff()
      })
     
    }else{
      alert("Escoge un almacen o un serial")
      this.loaderService.loadingOff()
    }
  }
}
