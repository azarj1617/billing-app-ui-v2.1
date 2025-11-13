import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ItemMasterComponent } from './item-master/item-master.component';
import { ItemsRoutingModule } from './items-routing.module';



@NgModule({
  declarations: [ItemMasterComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ItemsRoutingModule
  ]
})
export class ItemsModule { }
