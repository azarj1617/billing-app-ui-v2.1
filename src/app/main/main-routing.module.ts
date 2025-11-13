import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemMasterComponent } from './Items/item-master/item-master.component';
import { AuthGuardService } from '../core-services/auth-guard.service';
import { CustomerMasterComponent } from './customers/customer-master/customer-master.component';
import { QuotesComponent } from './billing/quotes/quotes/quotes.component';
import { ConfirmActionComponent } from '../shared-components/confirm-action/confirm-action.component';

const routes: Routes = [
  {
    path: 'billing',canActivate: [AuthGuardService],
    loadChildren: () => import('./billing/billing.module').then(m => m.BillingModule)
  },
  { path: 'item-master', component: ItemMasterComponent,canActivate: [AuthGuardService] },
  
  { path: 'customer-master', component: CustomerMasterComponent,canActivate: [AuthGuardService] },
  { path: 'confirm', component: ConfirmActionComponent,canActivate: [AuthGuardService] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule {
  
}
