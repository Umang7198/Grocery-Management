import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';
import { Cart } from '../../models/cart.model';
import { User } from '../../models/user.model';
import { Product } from '../../models/product.model';



@Component({
  selector: 'app-cart',
  imports:[RouterLink,CommonModule,NgIf,NgFor],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  loggedInUserId: string | null = null;
  // cart: Cart = { id: 0, userId: '', items: [] };
  userDetails:User | null=null;
  carts:Cart | null=null;
  cartSummary:any = null;
  productsToDisplay:Product[] | null=null
  total:number = 0;
  constructor(private http: HttpClient, private router: Router,
    private appStateService:AppStateService
  ) {}

  ngOnInit() {
    let userDetail = localStorage.getItem('userDetails');
    let token = localStorage.getItem('token');


    if(userDetail && token){
      this.appStateService.setUserDetails(JSON.parse(userDetail))
      this.appStateService.setToken(token)
    }

    this.appStateService.userDetail$.subscribe((userDetails) => {
      this.userDetails = userDetails;
    })


    this.appStateService.cart$.subscribe((carts)=>{
      this.carts=carts;
    })
    if (!this.userDetails?.id) {
      alert('Please log in to view your cart.');
      this.router.navigate(['/login']);
      return;
    }

    // // Fetch the user's cart from the JSON server
    // this.http.get<Cart[]>(`http://localhost:3000/cart?userId=${this.loggedInUserId}`).subscribe({
    //   next: (carts) => {
    //     if (carts.length > 0) {
    //       this.cart = carts[0]; // Assume one cart per user
    //     } else {
    //       // If no cart exists, create a new one
    //       const newCart = { userId: this.loggedInUserId, items: [] };
    //       this.http.post<Cart>('http://localhost:3000/cart', newCart).subscribe({
    //         next: (createdCart) => this.cart = createdCart,
    //         error: (error) => console.error('Error creating cart:', error)
    //       });
    //     }
    //   },
    //   error: (error) => {
    //     console.error('Error fetching cart:', error);
    //     alert('Failed to load cart. Please try again.');
    //   }
    // });
    this.updateCartSummary()
  }
  getQuantityInCart(productId: number): number {
    if (!this.carts?.items.length) return 0;
    const totalQunatity = this.carts.items.reduce((quantity: number, item: Product, currentQuantity: number) => {

      if (item.id === productId) {
        return quantity + 1;
      } else {
        return quantity;
      }
    }, 0);
    console.log(totalQunatity)
    return totalQunatity;
  }
  // Calculate total amount dynamically
  get totalAmount(): number {
    return this.carts!.items.reduce((sum, item) => sum + item.price , 0);
  }

  // Update item quantity and sync with server
  updateQuantity(product: Product, change: number) {
  
    if (change == 1) {
      this.carts?.items.push(product);
    }
    if (change == -1) {
      let index = this.carts?.items.findIndex((item) => item?.id == product.id);
      if ((index!) >= 0) this.carts?.items.splice(index!, 1)

    }
    this.appStateService.setCart(this.carts);
    this.updateCartSummary()
  }

  // Remove item from cart and sync with server
  removeItem(itemToRemove: Product) {
    this.carts!.items = this.carts!.items.filter((item:Product)=>item.id!=itemToRemove.id);
    this.appStateService.setCart(this.carts);
    
  }

  // Update cart on the server
  // private updateCartOnServer() {
  //   this.http.put(`http://localhost:3000/cart/${this.cart.id}`, this.cart).subscribe({
  //     next: () => console.log('Cart updated'),
  //     error: (error) => console.error('Error updating cart:', error)
  //   });
  // }

  // Handle checkout
  checkout() {
    if (this.carts?.items.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    alert('Order Placed Successfully!');
    //this.router.navigate(['/transaction']);
    this.router.navigate(['/transaction']);
  }
  updateCartSummary() {
    this.cartSummary = {};
    this.total = 0;
    this.carts?.items.forEach((item) => {
        if (this.cartSummary[item.id!]) {
            this.cartSummary[item.id!].quantity += 1;
        } else {
            this.cartSummary[item.id!] = { ...item, quantity: 1 };
        }
        this.total += item.price!;
    });
    // if(this.cartSummary.quantity==0) removeItem()
    this.productsToDisplay=Object.values(this.cartSummary)
}
  // Logout and redirect to home
  logout() {
    localStorage.removeItem('loggedInUserId');
    localStorage.removeItem("userDetails");

    this.router.navigate(['/home']);
  }

}
