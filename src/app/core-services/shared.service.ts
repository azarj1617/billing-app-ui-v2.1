import { DecimalPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private loaderSubject = new BehaviorSubject<boolean>(false);
  isShowLoader$ = this.loaderSubject.asObservable();
  constructor(private decimalPipe: DecimalPipe) { }

  showLoader() {
    this.loaderSubject.next(true);
  }

  hideLoader() {
    this.loaderSubject.next(false);
  }

  formatNumber(value: number): string {
    return this.decimalPipe.transform(value, '1.2-2') ?? '';
  }
}
