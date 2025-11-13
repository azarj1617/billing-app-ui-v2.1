import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertService } from 'src/app/core-services/alert.service';
import { SharedService } from 'src/app/core-services/shared.service';
declare var $:any;
@Component({
  selector: 'app-common-table',
  templateUrl: './common-table.component.html',
  styleUrls: ['./common-table.component.scss']
})
export class CommonTableComponent {
  @Input() header:any=[];
  @Input() dataList:any=[];
  itemData:any={};
  @Input() config:any={
    //Sample Config Data
    // buttonList:[{label:'Add Item'},{label:'Import'}],
    // actionList:[{name:'Edit',class:'fas fa-pen',btnClass:'btn-light'},
    //             // {class:'fas fa-trash',btnClass:'btn-danger'}
    //           ],
    // ddConfig:{
    //   options:[{name:'Active'},{name:'Inactive'}]
    // }
  }
  @Output() action:any = new EventEmitter();
  constructor(private alertSerice:AlertService,private sharedService:SharedService){}

  ngOnInit(){
    console.log(this.config);
    
  }
  ngOnChanges(){
    
  }
  actionClick(rowData:any,actionType:any){
     let actionData = {
      actionType:actionType?.toLowerCase(),
      data:rowData
    }
    this.action.emit(actionData);  
  }
  btnAction(callType:any){
    let actionData = {
      actionType:callType?.toLowerCase()
    }
    this.action.emit(actionData);   
  }

  searchFun(eve:any){
     let actionData = {
      actionType:'search',
      data:eve?.target?.value?.toLowerCase()
    }
    this.action.emit(actionData); 
  }

  ddChange(eve:any){
    let actionData = {
      actionType:'dropDown',
      data:eve?.target?.value?.toLowerCase()
    }
    this.action.emit(actionData);  
  }
  
  execFun(data:any){
    return data?.exec
  }
}
function Ouuput(): (target: CommonTableComponent, propertyKey: "action") => void {
  throw new Error('Function not implemented.');
}

