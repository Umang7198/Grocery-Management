import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:3000/cart'; // Adjust URL as needed

  constructor(private http: HttpClient) {}

  addToCart(product: any): Observable<any> {
    return this.http.post(this.apiUrl, product);
  }
}