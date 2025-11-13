import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RestService } from 'src/app/core-services/rest.service';
import { ItemMasterService } from 'src/app/core-services/services/item-master.service';
import { Items } from '../Items';
import { AlertService } from 'src/app/core-services/alert.service';
import { SharedService } from 'src/app/core-services/shared.service';
declare var $:any;
@Component({
  selector: 'app-item-master',
  templateUrl: './item-master.component.html',
  styleUrls: ['./item-master.component.scss']
})
export class ItemMasterComponent {
  header:any=[
    {name:'Item Name',field:'itemName'},
    {name:'Description',field:'itemDescription'},
    {name:'UOM',field:'uom'},
  ];
  dataList:any=[];
  itemData:any={};
  config:any={
    buttonList:[{label:'Add Item'},{label:'Import'}],
    actionList:[{name:'Edit',class:'fas fa-pen',btnClass:'btn-light'},
                // {class:'fas fa-trash',btnClass:'btn-danger'}
              ],
    ddConfig:{
      options:[{name:'Active'},{name:'Inactive'}]
    }
  }
  modelTitle:any=''
  priceList:any=[{mrp:'',sellingPrice:'',wholeSalePrice:'',costPrice:0.00,saveValue:0.00}];
  isNoAddPriceBtn:boolean = true;
  itemMasterForm!:FormGroup;
  statusFilter:any = 1;
  deletedPriceIds:any = [];
  uploadFile:any;
  constructor(private itemMasterServ:ItemMasterService,private alertSerice:AlertService,private sharedService:SharedService){}

  ngOnInit(){
    this.getItemsList();
    this.initializeItemMasterForm();
    // this.getItemDetailsById();
  }
  initializeItemMasterForm(){
    let itemData:any = Items;
    this.itemMasterForm = new FormGroup({
      itemId: new FormControl(itemData.itemId),
      itemName: new FormControl(itemData.itemName, Validators.required),
      itemDescription: new FormControl(itemData.itemDescription, Validators.required),
      uom:new FormControl(itemData.uom, Validators.required),
      eaCode:new FormControl(itemData.eaCode, Validators.required),
      status:new FormControl(itemData.status)
    });
  }
  actionClick(itemData:any,actionType:any){
    if(actionType?.toLowerCase()=='edit'){
      console.log(itemData);      
        this.modelTitle='Edit Item';
        this.priceList = itemData?.priceDetails;
        this.itemMasterForm.patchValue(itemData);
        this.priceChange();
        this.modalOpen('item-master-modal');
    }
  }
  btnAction(callType:any){
    if(callType?.toLowerCase()=='add item'){
      this.modelTitle='Add Item';
      this.itemMasterForm.value.status = 1;
      this.modalOpen('item-master-modal');
    }else if(callType?.toLowerCase()=='import'){
      this.modelTitle='Import Items';
      this.modalOpen('import-modal');
    }   
  }
  getItemsList(status:number=1){
      this.sharedService.showLoader();
      this.itemMasterServ.getItemsList(status).subscribe((res:any)=>{
        this.sharedService.hideLoader();
        this.dataList = res;
      });
  }
  searchFun(eve:any){
    this.itemMasterServ.itemSearch(eve?.target?.value,this.statusFilter,'item').subscribe((res:any)=>{
         this.dataList = res;
    });
  }
  getItemDetailsById(itemId:any=2){
      this.itemMasterServ.getItemDetailsByItemId(itemId).subscribe((res:any)=>{
        this.itemData = res;
    });
  }
  saveItem(){
    this.itemMasterForm.value.status = (this.itemMasterForm.value.status)?1:0;
    let apiData = {
      ...this.itemMasterForm.value,
      priceDetails:this.priceList,
      deletedPriceIds:this.deletedPriceIds
    }
    let priceValid = this.priceList.every((item:any)=>item?.mrp && item.sellingPrice && item.wholeSalePrice && item.costPrice)
    if(this.itemMasterForm.valid && priceValid){
      if(this.itemMasterForm?.value?.itemId){
        this.updateItemDetails(apiData);
      }else{
        this.insertItems(apiData);
      }
    }else{
      console.log("Invalid Form");
      this.alertSerice.showAlert('W','Fill Missing Fields',5000);
    }  
  }
  insertItems(apiData:any){
     this.itemMasterServ.addItem(apiData).subscribe((res:any)=>{
        if(res?.status?.toLowerCase()=='success'){
          this.alertSerice.showAlert('S',res?.message);
          this.modalClose('item-master-modal');
          this.getItemsList(this.statusFilter);
        }
     });
  }
  updateItemDetails(apiData:any){
      this.itemMasterServ.updateItem(apiData).subscribe((res:any)=>{
      if(res?.status?.toLowerCase()=='success'){
        this.alertSerice.showAlert('S',res?.message);
        this.modalClose('item-master-modal');
        this.getItemsList(this.statusFilter);
      }
      });
  }
  ddChange(eve:any){
     this.statusFilter = (eve?.target?.value?.toLowerCase()=='active')?1:0
     this.getItemsList(this.statusFilter);
  }
  modalOpen(id:any){
     const modalEl = document.getElementById(id);
    if (modalEl) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }
  modalClose(modelId:any=''){
    $(`#${modelId}`).modal('hide'); 
    if(modelId=='item-master-modal'){
       this.itemMasterForm.reset();
       this.deletedPriceIds = [];
       this.isNoAddPriceBtn = true;
       this.priceList = [{mrp:'',sellingPrice:'',wholeSalePrice:'',costPrice:0.00,saveValue:0.00}];
    }else if(modelId='import-modal'){
       this.uploadFile = '';
        $('#itemsImport').val('');
    }   
  }
  addPrice(){
    let priceData:any = {mrp:'',sellingPrice:'',wholeSalePrice:'',costPrice:0.00,saveValue:0.00};
    priceData.itemId = this.priceList[0].itemId;
    this.isNoAddPriceBtn = true;
    this.priceList.push(priceData);
  }
  deltePrice(priceData:any,i:any){
    console.log(priceData);    
    // let index = this.priceList?.findIndex((item:any)=> item?.priceId == priceData?.priceId);
    // console.log(index);
    
    if(i && i!=0){
      this.priceList.splice(i,1);
      if(priceData?.priceId){
        this.deletedPriceIds.push(priceData?.priceId);
      }       
    }else{
      this.alertSerice.showAlert('w','Sorry, Not Allowed to Delete!')
    }
   
  }
  priceChange(){
      this.isNoAddPriceBtn = this.priceList.some((item:any)=>!item?.mrp || !item.sellingPrice || !item.wholeSalePrice || !item.costPrice);
  }
  fileUpload(eve:any){
    this.uploadFile = eve?.target?.files[0];
  }
  importItems(){
    const formData = new FormData();
    formData.append('file', this.uploadFile); 
    this.sharedService.showLoader();
    this.itemMasterServ.importItems(formData).subscribe((res:any)=>{
      this.sharedService.hideLoader();
        if(res?.status?.toLowerCase()=='success'){
            this.modalClose('import-modal');
            this.alertSerice.showAlert('S',res?.message);
            this.getItemsList(this.statusFilter);
        }else{
            this.alertSerice.showAlert('W',res?.message);
        }
    });
  }
}
