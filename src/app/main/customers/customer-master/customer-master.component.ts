import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from 'src/app/core-services/services/customer.service';
import { Customer } from './Customer';
import { AlertService } from 'src/app/core-services/alert.service';
import { SharedService } from 'src/app/core-services/shared.service';
declare var $:any;
@Component({
  selector: 'app-customer-master',
  templateUrl: './customer-master.component.html',
  styleUrls: ['./customer-master.component.scss']
})
export class CustomerMasterComponent {

  configuration:any={
    screen:'Customer Master',
    search:true,
    buttonList:[{label:'Add Customer'},{label:'Import'}],
    actionList:[{name:'Edit',class:'fas fa-pen',btnClass:'btn-light'},
              ],
    ddConfig:{
      options:[{name:'Active'},{name:'Inactive'}]
    }
  }

  headerData:any=[
    {name:'Customer Name',field:'customerName',exec: (row: any) => `${row.customerFirstName ?? ''} ${row.customerLastName ?? ''}`.trim() },
    {name:'Address',field:'address'},
    {name:'City',field:'city'},
    {name:'State',field:'state'},
    {name:'Mobile',field:'mobile'},
    {name:'Price Type', field:'priceType', exec: (row: any) => {
      const map: any = { '0': 'Retail', '1': 'Wholesale' };
      return map[row.priceType] ?? 'Unknown';
    }}
  ];
  dataList:any = [];
  status:number = 1;
  modelTitle:any='Add Customer';
  customerMasterForm!:FormGroup;
  priceType:any = [{id:0,label:'Retail'},{id:1,label:'Wholesale'}];
  uploadFile:any;
  constructor(private customerService:CustomerService, private alertService:AlertService,private sharedService:SharedService){}

  ngOnInit(){
    this.getCustomerList(1);
    this.initializeCustomerMasterForm();
  }

  initializeCustomerMasterForm(){
      let customerData:any = Customer;
      this.customerMasterForm = new FormGroup({
        customerId: new FormControl(customerData.customerId),
        customerFirstName: new FormControl(customerData.customerFirstName, Validators.required),
        customerLastName: new FormControl(customerData.customerLastName),
        address:new FormControl(customerData.address),
        city:new FormControl(customerData.city),
        state:new FormControl(customerData.state),
        mobile:new FormControl(customerData.mobile,[Validators.required,Validators.pattern(/^\d{10}$/)]),
        priceType:new FormControl(customerData.priceType),
        status:new FormControl(customerData.status)
      });
  }
  actionFunc(eve:any){
    console.log(eve);  
    if(eve?.actionType=='add customer'){
      this.customerMasterForm.get('status')?.setValue(1);
      this.customerMasterForm.value.status = 1;
      this.modalOpen('customer-modal');
    }else if(eve?.actionType=='dropDown'){
      this.status = (eve?.data=='active')?1:0; 
      this.getCustomerList(this.status)
    }else if(eve?.actionType=='edit'){
      this.modelTitle = "Edit Customer";
      this.customerMasterForm.patchValue(eve?.data);
      this.modalOpen('customer-modal');           
    }else if(eve?.actionType=='import'){
      this.modalOpen('customer-import-modal');   
    }else if(eve?.actionType=='search'){
      this.searchCustomerData(eve?.data);
    }   
  }
  getCustomerList(status:any){
    this.customerService.getCustomerList(status).subscribe((res:any)=>{
      this.dataList = res;
    });
  }
  searchCustomerData(searchTerm:any){
     this.customerService.searchCustomers(searchTerm,this.status)?.subscribe((res:any)=>{
        this.dataList = res;
     });
  }
  saveCustomerData(){
    if(this.customerMasterForm?.valid){
    this.sharedService.showLoader();
    this.customerMasterForm.value.status = (this.customerMasterForm.value.status)?1:0;
    this.customerService.saveCustomer(this.customerMasterForm.value)?.subscribe((res:any)=>{
      this.sharedService.hideLoader();
        if(res?.status?.toLowerCase()=='success'){
          this.modalClose('customer-modal');
          this.getCustomerList(this.status);
          this.alertService.showAlert('S',res?.message);
        }else{          
          this.alertService.showAlert('W',res?.message);
        }
    });
  }else{
    if(this.customerMasterForm?.value?.mobile?.length<10){
        this.alertService.showAlert('W','Please Enter 10 Digit Mobile Number');
        return;
    }
    this.alertService.showAlert('W','Please Enter (*)Required Fields');
  }
  }
  modalOpen(id:any){
     const modalEl = document.getElementById(id);
    if (modalEl) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }
  modalClose(modelId:any){
    $(`#${modelId}`).modal('hide');
    if(modelId=='customer-modal'){
      this.customerMasterForm?.reset();
    }else if(modelId='customer-import-modal'){
       this.uploadFile = '';
        $('#customerImport').val('');
    }  
  }

   fileUpload(eve:any){
    this.uploadFile = eve?.target?.files[0];
  }

  importCustomers(){
    const formData = new FormData();
    formData.append('file', this.uploadFile); 
    this.sharedService.showLoader();
    this.customerService.importCustomers(formData).subscribe((res:any)=>{
    this.sharedService.hideLoader();
        if(res?.status?.toLowerCase()=='success'){
            this.modalClose('customer-import-modal');
            this.alertService.showAlert('S',res.message);
            this.getCustomerList(this.status);
        }else{
          this.alertService.showAlert('W',res.message);
        }
    });
  }

  onTextInput(event: any) {
    let value = event.target.value;
    value = value.replace(/[^a-zA-Z\u0B80-\u0BFF\s]/g, '');
    event.target.value = value;
  }
  onMobileInput(event: any) {
    let value = event.target.value;
    value = value.replace(/\D/g, '');
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    event.target.value = value;
    this.customerMasterForm.controls['mobile'].setValue(value, { emitEvent: false });
  }

}
