import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
declare var $:any;
@Component({
  selector: 'app-confirm-action',
  templateUrl: './confirm-action.component.html',
  styleUrls: ['./confirm-action.component.scss']
})
export class ConfirmActionComponent {
  
  @Input() config:any={};

  @Output() action:any = new EventEmitter();

  ngAfterViewInit() {
  $('#confirmModal').on('shown.bs.modal', () => {
    $(".actionBtn").eq(1).focus();
  });
}
  
  actionFun(type:any){
    this.action.emit(type);
  }

  @HostListener('window:keydown',['$event'])
  keyboardEvents(event:KeyboardEvent){  
    const target = event.target as HTMLElement;

    // ignore when user is typing in input, textarea, or editable content
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }  
    if(event.key.toLowerCase() === this.config?.actionBtnLabel?.toLowerCase()?.charAt(0)){
        this.action.emit(this.config?.actionBtnLabel?.toLowerCase())
    }
    if(event.key.toLowerCase() === this.config?.closeBtnLabel?.toLowerCase()?.charAt(0)){
           this.action.emit(this.config?.closeBtnLabel?.toLowerCase())
    }
  }
}
