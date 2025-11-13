import { Injectable } from '@angular/core';
import { RestService } from '../rest.service';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {

  constructor(private restService:RestService) { }

  getLatestQuoteNumber(){
    return this.restService.getMethod(`quotes/get-quote-number`);
  }

  saveQuotation(data:any){
    return this.restService.postMethod(`quotes/saveQuote`,data);
  }

  getDateWiseQuotation(data:any){
    return this.restService.postMethod(`quotes/getQuotesByDate`,data);
  }
  getQuoteDetailsByQuoteId(quoteId:number){
     return this.restService.getMethod(`quotes/getQuoteById?quoteId=${quoteId}`);
  }

  printQuotation(data:any){
    return this.restService.postMethod(`print/dot-bill`,data);
  }
}
