import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Seriales } from '../interface/serial.interface';
import { Productos } from '../interface/producto.interface';
import { Almacen } from '../interface/almacen.interface';
import { MovimientoSeriales } from '../interface/movseriales.interface';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MyErrorStateMatcher } from '../../matcher';
import { MonitorService } from '../servicios/monitor.service';
import { catchError, debounceTime, distinctUntilChanged, filter, map, Observable, of, startWith, switchMap } from 'rxjs';
import { group } from '@angular/animations';
import { LoaderService } from '../../../loader/loader.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import * as ExcelJs from 'exceljs'
import { saveAs } from 'file-saver';
export const _filter = (opt: string[], value: string): string[] => {
  const filterValue = value.toLowerCase();

  return opt.filter(item => item.toLowerCase().includes(filterValue));
};

@Component({
  selector: 'app-seriales',
  templateUrl: './seriales.component.html',
  styleUrl: './seriales.component.css'
})

export class SerialesComponent implements OnInit,AfterViewInit {
  public seriales!:Seriales[]
  public productos!:Productos[]
  public almacenes!:Almacen[]
  serialesGroupOption!:Observable<Seriales[]> | undefined
  productosGroupOption:Observable<Productos[]> | undefined
  almacenesGroupOption!:Observable<Almacen[]> | undefined
  public TablaSeriales!:MatTableDataSource<MovimientoSeriales>
  public displayedColumns: string[] = [ "dateSerial","serialNumber", "productSku","priceSku","productName","numberMovement", 
    "warehouseId",  "warehouseName", "typeMovement"]
  matcher = new MyErrorStateMatcher();
  private excelColumns:String[] = ['Sku','Descripción','Precio','Serial','N° Movimiento','Tipo movimiento','Fecha','Almacén','Nombre almacén']
  formSeriales : FormGroup;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator | any;
  constructor(public monitorService:MonitorService,
    private formBuilder: FormBuilder, private loaderService:LoaderService,
    private _liveAnnouncer: LiveAnnouncer
  ) {

    this.formSeriales = this.formBuilder.group({
      sku: [''],
      serial: [''],
      almacen: [''],
     
   
    });
  
  }
  ngOnInit(): void {
   
    
     this.productosGroupOption = this.formSeriales.get('sku')?.valueChanges.pipe(
      filter((value) => value?.length > 3),
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(val=> {return this._filterProduct(val || '')}),
      catchError(err => {
        console.error('Error fetching data:', err);
        return of([]); // Return an empty array in case of an error
      })    )

      this.almacenesGroupOption = this.formSeriales.get('almacen')?.valueChanges.pipe(
      filter((value) => value?.length > 3),
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
  ngAfterViewInit() {
    this.TablaSeriales.sort = this.sort;
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
        let almID = almOpt.whsCode.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) ===0
         let almName = almOpt.whsName.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) ===0
        
        return almID || almName
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
    this.TablaSeriales = new MatTableDataSource()
   }
   announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
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
     
    }else if(serial){

      this.loaderService.loadingOn()
      let data = {
     
       
        serial:serial
      }
      this.monitorService.postProductosSoloSeriales(data).subscribe(results=>{
        this.TablaSeriales = new MatTableDataSource(results)
        this.TablaSeriales.paginator = this.paginator
        this.TablaSeriales.sort = this.sort
        this.loaderService.loadingOff()
      })
    }else if(serial && almacen){
      
      this.loaderService.loadingOn()
      let data = {
        serial:serial,
       
        almacen:almacen
      }
      this.monitorService.postProductosSoloSerialesAlmacen(data).subscribe(results=>{
        this.TablaSeriales = new MatTableDataSource(results)
        this.TablaSeriales.paginator = this.paginator
        this.TablaSeriales.sort = this.sort
        this.loaderService.loadingOff()
      })
    }
    
    else{
      alert("Escoge un almacen o un serial")
      this.loaderService.loadingOff()
    }
  }

  generarExcel(){
    let timeSpan = new Date().toISOString();
    let sheetName,fileName = 'movimientos' + timeSpan
    const workBook = new ExcelJs.Workbook()
    const woorkSheet = workBook.addWorksheet(sheetName)
    woorkSheet.addRow(this.excelColumns)
    this.TablaSeriales.data.forEach(element => {
      woorkSheet.addRow([element.productSku,element.productName,element.priceSku,element.serialNumber,element.numberMovement,
        element.typeMovement,element.dateSerial,element.warehouseId,element.warehouseName])
    });

    workBook.xlsx.writeBuffer().then((buffer: any) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${fileName}.xlsx`);
    });

  }
}
