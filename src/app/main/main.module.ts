import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainRoutingModule } from './main-routing.module';
import { ItemMasterComponent } from './Items/item-master/item-master.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomerMasterComponent } from './customers/customer-master/customer-master.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonTableComponent } from '../shared-components/common-table/common-table.component';
import { ConfirmActionComponent } from '../shared-components/confirm-action/confirm-action.component';


@NgModule({
  declarations: [
    CustomerMasterComponent,
    CommonTableComponent,
    ConfirmActionComponent],
  imports: [
    CommonModule,
    MainRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule
  ],
  exports:[ConfirmActionComponent]
})
export class MainModule { }
