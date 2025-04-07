import { Component, OnInit, ViewChild } from '@angular/core';
import { Almacen } from '../../monitor/interface/almacen.interface';
import { Productos } from '../../monitor/interface/producto.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LoaderService } from '../../../loader/loader.service';
import { MonitorService } from '../../monitor/servicios/monitor.service';
import { SerialesService } from '../seriales.service';
import { catchError, debounceTime, distinctUntilChanged, filter, map, Observable, of, startWith, switchMap } from 'rxjs';
import { Serial } from '../serial.interface';
import { MatTableDataSource } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-available-monitor',
  templateUrl: './available-monitor.component.html',
  styleUrl: './available-monitor.component.css'
})
export class AvailableMonitorComponent implements OnInit{
   @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator | any;
  public productos!:Productos[]
    public almacenes!:Almacen[]
      productosGroupOption:Observable<Productos[]> | undefined
      almacenesGroupOption!:Observable<Almacen[]> | undefined
       public TablaSeriales!:MatTableDataSource<Serial>
   formSeriales : FormGroup;
   public displayedColumns: string[] = [ "itemCode","itemName", "serialNumber","warehouseCode","warehouseName", "quantityProduct"]
    constructor(public monitorService:MonitorService,
        private formBuilder: FormBuilder, private loaderService:LoaderService, 
        private serialesService:SerialesService,  private _liveAnnouncer: LiveAnnouncer) {
          this.formSeriales = this.formBuilder.group({
            sku: [''],
        
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
   
  }

  
  filterProduct(){
    this.productosGroupOption = this._filterProduct( this.formSeriales.get('sku')?.value)
  }

  
  filterAlmacen(){   this.almacenesGroupOption = this._filterAlmacen( this.formSeriales.get('almacen')?.value)}
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

    applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.TablaSeriales.filter = filterValue.trim().toLowerCase();
      if (this.TablaSeriales.paginator) {
        this.TablaSeriales.paginator.firstPage();
      }
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
        const { sku,  almacen } = this.formSeriales.value;

        if(sku && almacen){
          this.loaderService.loadingOn()
          let data = {
            sku:sku,
            almacen:almacen
          }
         
          this.serialesService.ConsultaSerialesDisponibles(data).subscribe(results=>{
            this.TablaSeriales = new MatTableDataSource(results)
            this.TablaSeriales.paginator = this.paginator
            this.TablaSeriales.sort = this.sort
            this.loaderService.loadingOff()
          })
        
       }
      
      
      }
}
