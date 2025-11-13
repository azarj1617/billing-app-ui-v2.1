import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
// import items from './items.json';
import { ItemMasterService } from 'src/app/core-services/services/item-master.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { QuoteService } from 'src/app/core-services/services/quote.service';
import { AlertService } from 'src/app/core-services/alert.service';
declare var $:any;
import moment from 'moment';
import { SharedService } from 'src/app/core-services/shared.service';
import { CustomerService } from 'src/app/core-services/services/customer.service';
import { Items } from 'src/app/main/Items/Items';
@Component({
  selector: 'app-quotes',
  templateUrl: './quotes.component.html',
  styleUrls: ['./quotes.component.scss']
})
export class QuotesComponent {
[x: string]: any;
  @ViewChild('auto') matAutocomplete: any;
  @ViewChild('customerInput') customerInput!: ElementRef;
  selectedDate = moment().format('YYYY-MM-DD');
  today = moment().format('YYYY-MM-DD');
  itemList:any = [];
  myControl = new FormControl('');
  customerForm= new FormControl('');
  itemForm= new FormControl('');
  searchItemsList:any=[];
  selectedItemId:any='';
  tempselectedItem:any={};
  multiPriceList:any=[];
  totalNetAmount:any=0;
  quoteNumber:any;
  quotationList:any = [];
  selectedQuote:any;
  deleteIds:any=[];
  activePriceIndex:number=0;
  customerList:any = [];
  selectedCustomerDetails:any = {};
  itemChange = false;
  itemIndex = 0;
  defaultCustomer:any={};
  modelTitle:any='Add Item';
  itemMasterForm!:FormGroup;
  priceList:any=[{mrp:'',sellingPrice:'',wholeSalePrice:'',costPrice:0.00,saveValue:0.00}];
  isNoAddPriceBtn:boolean = true;
  deletedPriceIds:any = [];
  confirmActionConfig = {
    message:"Do you want to print quote?",
    actionBtnLabel:'Yes',
    closeBtnLabel:'No'
  }
  totalQuoteAmount:number=0;
  constructor(private itemMasterServ:ItemMasterService,private quoteService:QuoteService,
    private alertService:AlertService,private sharedService:SharedService,private customerService:CustomerService){}
  ngOnInit() {
    this.getLatestQuoteNo();
    $('#item-search').focus();
    this.defaultCustSelection();
    this.initializeItemMasterForm();
    
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
  getLatestQuoteNo(){
    this.quoteService.getLatestQuoteNumber().subscribe((res:any)=>{
        this.quoteNumber = res?.quoteNo;
    });
  }
  customerSearch(eve:any){
    let searchTerm = eve?.target?.value;
      if(searchTerm){
      this.customerService.searchCustomers(searchTerm,1)?.subscribe((res:any)=>{
          this.customerList = res;
      });
   }
  }
  defaultCustSelection(){
    this.customerService.searchCustomers(1,1)?.subscribe((res:any)=>{
        this.defaultCustomer = res[0];
        this.selectedCustomerDetails = this.defaultCustomer;
    });
  }
  async selectedCustomer(data:any){
    this.selectedCustomerDetails = this.customerList?.filter((customer:any)=> customer?.customerId == data?.value)[0];
    await this.itemList?.forEach((item:any) => {
      let price = (this.selectedCustomerDetails?.priceType==1)?
                  item.orgWholeSalePrice : item.orgSellingPrice;
      item.wholeSalePrice = item.orgWholeSalePrice;
      item.sellingPrice = item.orgSellingPrice
      item.amount = item.quantity * price;
    });   
    setTimeout(() => {
      this.totalAmountCalc();  
    }, 10);    
    setTimeout(() => {
      $('#item-search').focus();
      this.customerList = [];
    }, 1);
  }
  searchItems(eve:any,i: number = -1){
    this.searchItemsList = [];
    if(eve?.target?.value){
      this.itemMasterServ.itemSearch(eve?.target?.value,1,'search').subscribe((res:any)=>{
          if (i > -1) {
              this.itemList[i].searchItemsList = res || [];
          } else {
            this.searchItemsList = res || [];
          }    
      });
    }
  }
  // If your item looks like { itemId: number, itemName: string }
  displayFn(item: any): string {
    return item?.itemName ?? '';
  }

  eaCodeEnter(eve:any){ 
    if((eve?.code?.toLowerCase()=='enter' || eve?.code?.toLowerCase()=='numpadenter')  && eve?.target?.value){
        this.itemMasterServ.itemSearch(eve?.target?.value,1,'eaCode').subscribe((res:any)=>{
          this.myControl.setValue("");
          if(res?.length>0){
              this.tempselectedItem = res[0];
              this.selectItem({value:res[0]?.itemId},'enter');
              if(res[0]?.priceDetails?.length>1){
                this.multiPriceList = res[0]?.priceDetails;
                this.showPanel = true;
              }
              
              // this.modalOpen('multi-price');
              
            // this.searchItemsList = res;
            // this.selectItem({value:res[0]?.itemId});
          }else{
            this.alertService.showAlert('W',`No Items Match found for ${eve?.target?.value}`);
          }          
        });
    }
  }
  matId(id:any){
    return id;
  }
  async selectItem(selectedItem:any,callType:any=''){
    // console.log(selectedItem);    
      this.selectedItemId = selectedItem?.value;
      if(callType!='enter'){
        this.tempselectedItem = this.searchItemsList?.filter((item:any)=> item?.itemId == this.selectedItemId)[0];
      }
      
      // console.log(this.tempselectedItem?.itemName,'selected');
     let price:any = (this.selectedCustomerDetails?.priceType==1)?this.tempselectedItem?.priceDetails[0]?.wholeSalePrice:this.tempselectedItem?.priceDetails[0]?.sellingPrice;
      if(this.tempselectedItem?.priceDetails?.length==1){
          this.tempselectedItem.sno = this.itemList?.length+1;
          this.tempselectedItem.quoteId = this.selectedQuote?.quoteId;
          this.tempselectedItem.quantity = 1;
          this.tempselectedItem.mrp = this.tempselectedItem?.priceDetails[0]?.mrp;
          this.tempselectedItem.orgSellingPrice = this.tempselectedItem?.priceDetails[0]?.sellingPrice;
          this.tempselectedItem.orgWholeSalePrice = this.tempselectedItem?.priceDetails[0]?.wholeSalePrice;
          this.tempselectedItem.sellingPrice = this.tempselectedItem?.priceDetails[0]?.sellingPrice;
          this.tempselectedItem.wholeSalePrice = this.tempselectedItem?.priceDetails[0]?.wholeSalePrice;
          this.tempselectedItem.amount = this.tempselectedItem?.quantity * price;
          let matchedIndex = await this.findMatch(this.tempselectedItem);
          if(matchedIndex !== -1){
            this.itemList[matchedIndex].quantity = this.itemList[matchedIndex].quantity+1;
            this.itemList[matchedIndex].amount = this.itemList[matchedIndex].quantity * price;
          }else{
            this.itemList.push(this.tempselectedItem);
            this.itemList = this.itemList.sort((a:any, b:any) => b.sno - a.sno);
          }         
          this.totalAmountCalc();
          this.myControl.setValue("");
           setTimeout(() => {
           
            $('#qty0').focus().select();       
          }, 10);
      }else{
        this.multiPriceList = this.tempselectedItem?.priceDetails;
        setTimeout(() => {
          this.showPanel = true;  
        }, 10);        
        // this.modalOpen('multi-price');
        // this.showPanel = true;
      }       
       this.searchItemsList = []; 
  }
  async priceSelect(eve:any=''){ 
      let i = eve?.value;
       let price = (this.selectedCustomerDetails?.priceType==1)?this.multiPriceList[i]?.wholeSalePrice:this.multiPriceList[i]?.sellingPrice;
       this.tempselectedItem.sno = (!this.itemChange)?this.itemList?.length+1:this.tempselectedItem.sno;
       this.tempselectedItem.quoteId = this.selectedQuote?.quoteId;
       this.tempselectedItem.quantity = 1;
       this.tempselectedItem.mrp = this.multiPriceList[i]?.mrp;
       this.tempselectedItem.orgSellingPrice = this.multiPriceList[i]?.sellingPrice;
       this.tempselectedItem.orgWholeSalePrice = this.multiPriceList[i]?.wholeSalePrice;
       this.tempselectedItem.sellingPrice =  this.multiPriceList[i]?.sellingPrice;
       this.tempselectedItem.wholeSalePrice = this.multiPriceList[i]?.wholeSalePrice;
       this.tempselectedItem.amount = this.tempselectedItem?.quantity * price;
    
       if(!this.itemChange){
        let matchedIndex = await this.findMatch(this.tempselectedItem);
          if(matchedIndex !== -1){
            this.itemList[matchedIndex].quantity = this.itemList[matchedIndex].quantity+1;
            this.itemList[matchedIndex].amount = this.itemList[matchedIndex].quantity * price;
          }else{
            this.itemList.push(this.tempselectedItem);
            this.itemList = this.itemList.sort((a:any, b:any) => b.sno - a.sno);
          }        
       }else{
          this.itemList[this.itemIndex]=this.tempselectedItem;
       }       
       this.totalAmountCalc();
      //  this.modalClose('multi-price');
      this.multiPriceList = [];
       this.myControl.setValue("");
       this.itemChange = false;
       setTimeout(() => {
        $(`#qty0`).focus().select(); 
       }, 0);       
  }
  changeItem(eve:any,selectedItem:any,i:any){  
      this.selectedItemId = eve?.value;
      if(!this.itemChange){
        this.tempselectedItem = selectedItem?.searchItemsList?.filter((item:any)=> item?.itemId == this.selectedItemId)[0];
      }
    
      if(this.tempselectedItem?.priceDetails?.length==1){
          this.tempselectedItem.sno = selectedItem?.sno;
          this.tempselectedItem.quoteId = this.selectedQuote?.quoteId;
          this.tempselectedItem.quantity = 1;
          this.tempselectedItem.mrp = this.tempselectedItem?.priceDetails[0]?.mrp;
          this.tempselectedItem.orgSellingPrice = this.tempselectedItem?.priceDetails[0]?.sellingPrice;
          this.tempselectedItem.orgWholeSalePrice = this.tempselectedItem?.priceDetails[0]?.wholeSalePrice;
          this.tempselectedItem.sellingPrice = this.tempselectedItem?.priceDetails[0]?.sellingPrice;
          this.tempselectedItem.wholeSalePrice = this.tempselectedItem?.priceDetails[0]?.wholeSalePrice;
          let price = (this.selectedCustomerDetails?.priceType==1)?
                  this.tempselectedItem.wholeSalePrice : this.tempselectedItem.sellingPrice;
          this.tempselectedItem.amount = this.tempselectedItem?.quantity * price;
          this.itemList[i] = this.tempselectedItem;
          this.itemList = this.itemList.sort((a:any, b:any) => b.sno - a.sno);
          this.totalAmountCalc();
          this.itemForm.setValue(this.tempselectedItem?.itemName);
           setTimeout(() => {
            $(`#qty${i}`).focus().select();       
          }, 10);
      }else{
         
        this.tempselectedItem.sno = selectedItem?.sno;
        this.multiPriceList = this.tempselectedItem?.priceDetails;
        this.itemList[i].searchItemsList = [];
        this.itemChange = true;
        this.itemIndex = i;
        setTimeout(() => {
          this.showPanel = true;  
        }, 10);        
      }    
      if(selectedItem?.quoteDetailId){
        this.delteItem(selectedItem,i,'itemChange');   
      }
      
       this.searchItemsList = []; 
  }
  totalAmountCalc(){
    this.totalNetAmount = this.itemList.reduce((sum:any, item:any) => sum + item.amount, 0);
  } 
  priceChange(eve:any,itemData:any,i:number){
    let price:any = parseFloat(eve?.target?.value); 
    console.log(price);    
    if(eve?.type=='change' || eve?.code?.toLowerCase()=='enter' || eve?.code?.toLowerCase()=='numpadenter'){
      if(this.selectedCustomerDetails?.priceType==1){
          this.itemList[i].wholeSalePrice = price;
      }else{
          this.itemList[i].sellingPrice = price;
      }
      
       $('#item-search').focus();
       return;
    }else if(eve?.code?.toLowerCase()=='arrowdown'){
        this.arrow('price','down');
    }else if(eve?.code?.toLowerCase()=='arrowup'){
        this.arrow('price','up');
    }if(eve?.ctrlKey && eve?.key?.toLowerCase()=='d'){
      eve.preventDefault();
      this.delteItem(itemData,i);
       $('#item-search').focus();
       return;
    }
    
    this.itemList[i].amount = this.itemList[i].quantity * price;
    this.totalAmountCalc();
    
  }
  quantityChange(eve:any,i:number){
    let qty = parseFloat(eve?.target?.value);
    let price = (this.selectedCustomerDetails?.priceType==1)?
                  this.itemList[i].wholeSalePrice : this.itemList[i].sellingPrice;
    this.itemList[i].amount = qty * price;
    this.totalAmountCalc();
  }
  delteItem(itemData:any,i:number,callType:any=''){
    if(itemData?.quoteDetailId){
      this.deleteIds.push(itemData?.quoteDetailId);
      if(callType == 'itemChange')
        {
          return;
        }
    }
    this.itemList.splice(i,1);
    this.serialNoRecreate();
     this.totalAmountCalc();
  }
  quoteSave(type:any=''){
    let apiData = {
      customer:[this.selectedCustomerDetails],
      customerId:this.selectedCustomerDetails?.customerId,
      quoteId:this.selectedQuote?.quoteId,
      quoteDate:(this.selectedQuote?.quoteDate)?this.selectedQuote?.quoteDate:moment()?.format('YYYY-MM-DD HH:mm:ss'),
      totalAmount:this.totalNetAmount,
      details : this.itemList,
      deleteIds : this.deleteIds,
      print:(type=='print')?true:false
    }
    let priceValid = this.itemList.every((item:any)=>item?.quantity && item?.quantity!=0 && ((this.selectedCustomerDetails?.priceType==1)?(item.wholeSalePrice && item.wholeSalePrice!=0):(item.sellingPrice && item.sellingPrice!=0 )));
    if(apiData?.customer && apiData?.quoteDate && priceValid){
    this.quoteService.saveQuotation(apiData).subscribe((res:any)=>{
        this.modalClose('confirmModal');
        if(res?.status?.toLowerCase()=='success'){
          this.alertService.showAlert('S',res?.message);
          this.getLatestQuoteNo();
          this.quoteClear();
        }else{
          this.alertService.showAlert('W',res?.message);
          this.getLatestQuoteNo();
        }
    });
  }else{
    this.alertService.showAlert('W','Please enter valid details');
     this.modalClose('confirmModal');
  }  
  }
  quotePrint(data:any='',i:any=''){
    if(data){
      this.quoteService.getQuoteDetailsByQuoteId(data?.quoteId).subscribe((res:any)=>{
          this.quoteService.printQuotation(res).subscribe((res:any)=>{
          this.getLatestQuoteNo();
          this.quoteClear();
      });
      });
      return; 
    }
    let apiData = {
      customer:[this.selectedCustomerDetails],
      customerId:this.selectedCustomerDetails?.customerId,
      quoteDate:(this.selectedQuote?.quoteDate)?this.selectedQuote?.quoteDate:moment()?.format('YYYY-MM-DD HH:mm:ss'),
      quoteId:this.selectedQuote?.quoteId,
      dailyQuoteNo:this.selectedQuote?.dailyQuoteNo,
      totalAmount:this.totalNetAmount,
      details : this.itemList,
      deleteIds : this.deleteIds
    }
      this.quoteService.printQuotation(apiData).subscribe((res:any)=>{
        this.getLatestQuoteNo();
        this.quoteClear();
      });
    }
  serialNoRecreate(){
    let count = this.itemList.length;
     this.itemList.sort((a:any, b:any) => b.sno - a.sno);
    this.itemList = this.itemList.map((item:any) => ({
    ...item,
    sno: count--
  }));
  }

  getDateWiseQuoteList(eve:any){
    this.selectedDate = eve?.target?.value;
    let apiData = {
      startDate : this.selectedDate + " 00:00:00",
      endDate : this.selectedDate + " 23:59:59"
    }
    if(this.selectedDate){
      this.quoteService.getDateWiseQuotation(apiData).subscribe((res:any)=>{
        this.quotationList = res;
         this.totalQuoteAmount = this.quotationList.reduce((sum:any, item:any) => sum + item.totalAmount, 0)
        if(res && res?.length==0){
          this.alertService.showAlert('W','No Bills for the selected date!')
        }
      });
    }
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
    this.multiPriceList = [];
    if(modelId=='item-master-modal'){
      this.itemMasterForm.reset();
      this.priceList = [{mrp:'',sellingPrice:'',wholeSalePrice:'',costPrice:0.00,saveValue:0.00}];
    }
  }
  quoteClear(){
    this.itemList = [];
    this.totalNetAmount = 0;
    this.selectedQuote = {};
    this.deleteIds = [];
    this.searchItemsList=[];
    this.multiPriceList = [];
    this.showPanel = false;
    this.myControl.setValue("");
    this.customerForm.setValue("");
    this.getLatestQuoteNo();
    this.selectedCustomerDetails = this.defaultCustomer;
    this.customerList = [];
    this.selectedDate = moment().format('YYYY-MM-DD');
    $('#item-search').focus();
  }
  itemChangeFun(eve:any,itemData:any,i:number){
    console.log(eve);    
    if(eve?.ctrlKey && eve?.key?.toLowerCase()=='d'){
      eve.preventDefault();
      this.delteItem(itemData,i);
       $('#item-search').focus();
       return;
    }
     if(eve?.key=="F2"){
        eve.preventDefault();
        this.itemMasterForm.patchValue(itemData);
        this.priceList = itemData?.priceDetails;
        this.modalOpen('item-master-modal');
    }
     if((eve?.code?.toLowerCase()=='enter' || eve?.code?.toLowerCase()=='numpadenter')  && eve?.target?.value && eve?.target?.value?.lenth<=4){
        this.itemMasterServ.itemSearch(eve?.target?.value,1,'eaCode').subscribe((res:any)=>{
          eve.target.value = "";
          if(res?.length>0){
              this.tempselectedItem = res[0];
               this.itemChange = true;
              this.changeItem({value:res[0]?.itemId},itemData,i);
              // if(res[0]?.priceDetails?.length>1){
              //   this.multiPriceList = res[0]?.priceDetails;
              //   this.showPanel = true;
              // }
              
              // this.modalOpen('multi-price');
              
            // this.searchItemsList = res;
            // this.selectItem({value:res[0]?.itemId});
          }else{
            this.alertService.showAlert('W',`No Items Match found for ${eve?.target?.value}`);
          }          
        });
    }
    // else{
    //   console.log('no match');
    //   setTimeout(() => {
    //     $(`#qty${i}`).focus();  
    //   }, 2);
    // } 
  }
  qtyChange(eve:any,itemData:any,i:number){
    if(eve?.ctrlKey && eve?.key?.toLowerCase()=='d'){
      eve.preventDefault();
      this.delteItem(itemData,i);
       $('#item-search').focus();
       return;
    }
    if(eve?.code?.toLowerCase()=='enter' || eve?.code?.toLowerCase()=='numpadenter'){
       $(`#price${i}`).focus().select();
       return;
    }
    if(eve?.code?.toLowerCase()=='arrowdown'){
        this.arrow('qty','down');
    } else if(eve?.code?.toLowerCase()=='arrowup'){
        this.arrow('qty','up');
    }
    // if(i==0){
    //    $('#price0').focus().select();
    // }
  }

  quoteSelect(quoteData:any,i:number){
    this.selectedQuote = quoteData;
    this.quoteNumber=quoteData?.dailyQuoteNo;
      this.quoteService.getQuoteDetailsByQuoteId(quoteData?.quoteId).subscribe((res:any)=>{
      this.selectedCustomerDetails = res.customer[0];      
      this.quotationList=[];
      this.itemList = res?.details;
      let count = this.itemList.length;
      this.itemList = this.itemList.map((item:any) => ({
        ...item,
        sno: count--,
        amount: item?.quantity * (
          this.selectedCustomerDetails?.priceType == 1
            ? item.wholeSalePrice
            : item.sellingPrice
        )
      }));
    this.itemList = this.itemList.sort((a:any, b:any) => b.sno - a.sno);
   
    this.customerForm.setValue(this.selectedCustomerDetails?.customerId);
      this.serialNoRecreate();
      this.totalAmountCalc();
    });
      
  }
  //Keboard Events
  arrow(id:any,type:any){
    const allPriceInputs = $(`input[id^="${id}"]`);
    let currentIndex:any = allPriceInputs.index(document.activeElement);
    currentIndex = (type=='down')?(currentIndex + 1):(currentIndex- 1)
    const nextIndex = currentIndex % allPriceInputs.length;
    allPriceInputs.eq(nextIndex).focus();
    setTimeout(() => {
      allPriceInputs.eq(nextIndex).select();
    }, 0);
  }

  //Decimal Formats
  formatNumber(value: number,i:any) {
    this.itemList[i].sellingPrice =  this.sharedService.formatNumber(value);
  }
   

  showPanel = false;
  selectedIndex = 0;
  panelBottom = 20; 
  panelright = 10; 

  @HostListener('window:keydown',['$event'])
  keyboardEvents(event:KeyboardEvent){
    // console.log(event);    
    if (event.ctrlKey && event.key.toLowerCase() === 's') {
      event.preventDefault();
      if(this.itemList?.length>0){
       this.confirmation();
      }      
    }
    if (event.altKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      this.quoteClear();
    }
    if (event.ctrlKey && event.key.toLowerCase() === 'h') {
      event.preventDefault();
      let data = {
        target:{
          value:moment()?.format?.('YYYY-MM-DD')
        }
      }
      this.getDateWiseQuoteList(data);
    }
     if (event.ctrlKey && event.key.toLowerCase() === 'p') {
      event.preventDefault();
      this.quotePrint();
    }
    if(event?.key=="F1"){
        event.preventDefault();
        this.itemMasterForm.value.status = 1;
        this.modalOpen('item-master-modal');
    }
    if (!this.showPanel) return;

    if (event.key === 'ArrowDown') {
      this.selectedIndex = (this.selectedIndex + 1) % this.multiPriceList.length;
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      this.selectedIndex = (this.selectedIndex - 1 + this.multiPriceList.length) % this.multiPriceList.length;
      event.preventDefault();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.myControl.setValue("");
      this.selectRow(this.multiPriceList[this.selectedIndex],this.selectedIndex); 
    } else if (event.key === 'Escape') {
      this.showPanel = false;
      this.selectedIndex = 0;
    }
  }

  selectRow(row: any,i:any) {
    // console.log('Selected Row:', row);
      this.priceSelect({value:i});
      this.showPanel = false;
      this.selectedIndex = 0;
      this.multiPriceList = [];
  }
  keyDown(eve:any){
    // console.log(eve);    
  }

  findMatch(itemData:any){
    console.log(itemData);
    
    const matchedIndex = this.itemList.findIndex((item:any) =>
        item.itemId === itemData.itemId &&
        item.mrp === itemData.mrp &&
        item.sellingPrice === itemData.sellingPrice &&
        item.wholeSalePrice === itemData.wholeSalePrice
    );
    return matchedIndex;
  }

  itemPriceChange(){
      this.isNoAddPriceBtn = this.priceList.some((item:any)=>!item?.mrp || !item.sellingPrice || !item.wholeSalePrice || !item.costPrice);
  }

   deltePrice(priceData:any){
    console.log(priceData);    
    let index = this.priceList?.findIndex((item:any)=> item?.priceId == priceData?.priceId);
    if(index && index!=-1){
      this.priceList.splice(index,1);
       this.deletedPriceIds.push(priceData?.priceId);
    }else{
      this.alertService.showAlert('w','Sorry, Not Allowed to Delete!')
    }
   
  }
  addPrice(){
    let priceData:any = {mrp:'',sellingPrice:'',wholeSalePrice:'',costPrice:0.00,saveValue:0.00};
    priceData.itemId = this.priceList[0].itemId;
    this.isNoAddPriceBtn = true;
    this.priceList.push(priceData);
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
      this.alertService.showAlert('W','Fill Missing Fields',5000);
    }  
  }
  updateItemDetails(apiData:any){
      this.itemMasterServ.updateItem(apiData).subscribe((res:any)=>{
      if(res?.status?.toLowerCase()=='success'){
        this.alertService.showAlert('S',res?.message);
        this.modalClose('item-master-modal');
        // this.getItemsList(this.statusFilter);
      }
      });
  }
  insertItems(apiData:any){
     this.itemMasterServ.addItem(apiData).subscribe((res:any)=>{
        if(res?.status?.toLowerCase()=='success'){
          this.alertService.showAlert('S',res?.message);
          this.modalClose('item-master-modal');
          // this.getItemsList(this.statusFilter);
        }
     });
  }
  confirmActionFun(eve:any){
    if(eve=='yes'){
        this.quoteSave('print');
    }else if(eve=='no'){
      this.quoteSave('noprint');
    }
  }
  confirmation(){
    if(this.selectedDate!=this.today && !this.selectedCustomerDetails?.quoteId){
      this.alertService.showAlert('W',"New Bill not allowed for past date!");
      return;
    }
    this.modalOpen('confirmModal');
  }
}
