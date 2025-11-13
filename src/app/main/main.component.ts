import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../core-services/shared.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  showLoader:boolean = false;
  shortCuts:any = [{name:'Item Master',icon:'far fa-clipboard'},
                   {name:'Customers Master',icon:'far fa-user'},
                   {name:'Quotation',icon:'fas fa-file-invoice'}];
  constructor(private router:Router,private sharedService:SharedService){}

  ngOnInit() {
    this.sharedService.isShowLoader$.subscribe(isVisible => {
      this.showLoader = isVisible;
    });
  }
  
  tollClick(type:any){
    if(type?.toLowerCase()=='item master'){
        this.router.navigateByUrl('main/item-master')
    }else if(type?.toLowerCase()=='customers master'){
         this.router.navigateByUrl('main/customer-master')
    }else if(type?.toLowerCase()=='quotation'){
         this.router.navigateByUrl('main/billing/quotes')
    }
  }

  logOut(){
      sessionStorage.clear();
      localStorage.clear();
      this.router.navigateByUrl('login');
  }
}
