import { Injectable } from '@angular/core';
import { RestService } from '../rest.service';
import { Subject, takeUntil } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemMasterService {
  stopItemSearch$: Subject<boolean> = new Subject<boolean>();
  constructor(private restService:RestService) { }

  getItemsList(status:number=1){
    return this.restService.getMethod(`items/get-all-items?status=${status}`);
  }
  getItemDetailsByItemId(itemId:any){
    return this.restService.getMethod(`items/get-item-details?itemId=${itemId}`);
  }
  addItem(data:any){
    return this.restService.postMethod(`items/insert-item`,data);
  }
  updateItem(data:any){
    return this.restService.postMethod(`items/update-item`,data);
  }
  itemSearch(searchTerm:any,status:number,type:any){
    this.stopItemSearch$.next(true);
    return this.restService.getMethod(`items/search-items?searchTerm=${searchTerm}&status=${status}&type=${type}`).pipe(takeUntil(this.stopItemSearch$));
  }
  importItems(fileData:any){
    return this.restService.postMethod(`items/import-items`,fileData);
  }
}
