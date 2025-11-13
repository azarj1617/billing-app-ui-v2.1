import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RestService {
  private baseUrl: string = environment.baseUrl || '';
  constructor(private http: HttpClient) { }
    getMethod(endPointUrl: string) {
    return this.http.get(`${this.baseUrl}/${endPointUrl}`);
    }
    postMethod(endPointUrl: string, payloadData: any) {
      return this.http.post(`${this.baseUrl}/${endPointUrl}`, payloadData);
    }
}
