import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AlertService } from '../core-services/alert.service';
import { SharedService } from '../core-services/shared.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {

  loginForm:any;
  private baseUrl: string = environment.baseUrl || '';
  constructor(private router:Router,private http: HttpClient,private alertService:AlertService,private sharedService:SharedService){

  }
  ngOnInit(){
      this.initializeLoginForm();
      this.isLoggedIn();
  }

initializeLoginForm(){
  this.loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });
}
isLoggedIn(){
  let token = localStorage.getItem("accessToken");
  if(token){
   this.router.navigateByUrl('main/item-master');
  }else{
     this.router.navigateByUrl('login');
  }
}
login(){
  if(this.loginForm?.status?.toLowerCase()=='valid'){
    let data ={
      username :this.loginForm?.value?.username,
      password :this.loginForm?.value?.password
    }
    this.sharedService.showLoader();
    this.http.post(`${this.baseUrl}/auth/login`,data).subscribe((res:any)=>{
      this.sharedService.hideLoader();
        if(res?.status?.toLowerCase()=='success'){
            localStorage.setItem("accessToken",res?.data?.accessToken);
            this.router.navigateByUrl('main/billing/quotes');
        }else{
          console.log(res?.message);
        }
    });
    
  }else{
    console.log("Enter Details to Login");  
    this.alertService.showAlert('W','Please Enter User Name / Password');
  }
}
}
