import { Injectable } from '@angular/core';
import { RestService } from '../rest.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(private restService:RestService) { }

  getCustomerList(status:any=1){
    return this.restService.getMethod(`customers/get-all-customers?status=${status}`);
  }

  saveCustomer(data:any){
     return this.restService.postMethod('customers/save-customer',data);
  }

  searchCustomers(searchTerm:any,status:any){
    return this.restService.getMethod(`customers/search-customer-data?searchTerm=${searchTerm}&status=${status}`);
  }

  importCustomers(fileData:any){
     return this.restService.postMethod(`customers/import-customers`,fileData);
  }
}
