import { Injectable } from '@angular/core';
declare var $:any;
@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  showAlert(type:any='W',message: any = "",timeout:number=5000) {
    const alertDiv = document.createElement("div");
    
    if(type?.toLowerCase()=='s'){
         alertDiv.className = "alert alert-success";
    }else if(type?.toLowerCase()=='w'){
         alertDiv.className = "alert alert-warning";
    }else if(type?.toLowerCase()=='i'){
          alertDiv.className = "alert alert-info";
    }else{
          alertDiv.className = "alert alert-danger";
    }
    alertDiv.role = "alert";
    alertDiv.innerText = message;

    $("#alertContainer").append(alertDiv);

    setTimeout(() => $(alertDiv).remove(), timeout);  
   }
}
