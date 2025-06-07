import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Product } from '../models/product.model';
import { Cart } from '../models/cart.model';

@Injectable({
    providedIn: 'root'
})
export class AppStateService {

    private userDetailsSubject = new BehaviorSubject<User | null>(null);
    public userDetail$ = this.userDetailsSubject.asObservable();

    private tokenSubject = new BehaviorSubject<string | null>(null);
    public token$ = this.tokenSubject.asObservable();

    private productsSubject = new BehaviorSubject<Product[] | null>(null);
    public products$ = this.productsSubject.asObservable();

    private cartSubject = new BehaviorSubject<Cart | null>(null);
    public cart$ = this.cartSubject.asObservable();

    private wishlistSubject = new BehaviorSubject<Product | null>(null);
    public wishlist$ = this.wishlistSubject.asObservable();

    

    async setCart(cart: Cart | null) {
        this.cartSubject.next(cart);
        // API CALL
        if (cart && this.tokenSubject.value) {
            fetch(`http://localhost:3000/cart/${cart?.id}`, {
                method: 'PUT',
                headers: {
                    Authorization: this.tokenSubject.value!
                },
                body:JSON.stringify(cart)
            })
        }

    }


    async setProducts(products: Product[] | null) {
        this.productsSubject.next(products);
    }


    async setUserDetails(user: User | null) {
        this.userDetailsSubject.next(user);
        if (user) {
            localStorage.setItem('userDetails', JSON.stringify(user));
        }
        else {
            localStorage.removeItem('userDetails')
        }
    }

    async setToken(token: string | null) {
        this.tokenSubject.next(token);

        if (token) {
            localStorage.setItem('token', token);
        }
        else {
            localStorage.removeItem('token')
        }
    }


}