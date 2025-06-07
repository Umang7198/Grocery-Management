import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { NgIf } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';
import { User } from '../../models/user.model';


interface Cart {
  id: number;
  userId: string;
  items: CartItem[];
}
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  userId: string;
}
interface Product {
  id: number;
  name: string;
  price: number;
  imgLink: string;
  description: string;
  quantity: number; // Assuming this is stock
}
@Component({
  selector: 'navbar',
  imports: [RouterLink, RouterOutlet, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  products: Product[] = [];
  searchString: string = '';
  userName: string = "Guest";
  loggedInUserId: string | null = null;
  cart: Cart | null = null; // Track cart locally
  userDetails: User | null = null;
  constructor(
    private router: Router,
    private http: HttpClient,
    private productService: ProductService,
    private cartService: CartService,
    private appStateService: AppStateService
  ) { }

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


    // this.loggedInUserId = JSON.parse(localStorage.getItem("userDetails")?? "{}").id;
    //  const userDetails = JSON.parse(localStorage.getItem("userDetails") ?? "{}");

    // if (Object.values(this.userDetails!).length === 0) {
    //   this.userName = "Guest";
    // } else {
    //   this.userName = this.userDetails!.name;
    // }

    // this.loadProducts();
    if (this.userDetails?.id) {
      this.loadCart();
    }
  }

  loadProducts(): void {
    this.http.get<Product[]>(`http://localhost:8080/api/getProducts`, ).subscribe((data: any) => {
      this.products = data.data;

    });
  }

  loadCart() {
    this.http.get<Cart[]>(`http://localhost:3000/cart?userId=${this.userDetails?.id}`).subscribe({
      next: (carts) => {
        if (carts.length > 0) {
          this.cart = carts[0];
        } else {
          this.cart = { id: 0, userId: this.loggedInUserId!, items: [] };
        }
      },
      error: (error) => console.error('Error fetching cart:', error)
    });
  }

  get isLoggedIn(): boolean {
    return !!this.userDetails?.id;
  }

  get filteredProducts() {
    return this.products.filter((product: Product) =>
      product.name.toLowerCase().includes(this.searchString.toLowerCase())
    );
  }



  addToCart(productId: number) {
    if (!this.loggedInUserId) {
      alert('Please login first to add to cart!');
      this.router.navigate(['/login']);
      return;
    }

    const product = this.products.find((p: Product) => p.id === productId);
    if (!product) return;

    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      userId: this.loggedInUserId
    };

    if (this.cart && this.cart.id) {
      const existingItem = this.cart.items.find(item => item.id === productId && item.userId === this.loggedInUserId);
      if (existingItem) {
        this.updateQuantity(productId, 1);
      } else {
        this.cart.items.push(cartItem);
        this.updateCart(this.cart);
        alert(`${product.name} added to cart!`);
      }
    } else {
      const newCart = { userId: this.loggedInUserId!, items: [cartItem] };
      this.http.post<Cart>('http://localhost:3000/cart', newCart).subscribe({
        next: (createdCart) => {
          this.cart = createdCart; // Update local cart with server-assigned ID
          alert(`${product.name} added to cart!`);
        },
        error: (error) => console.error('Error creating cart:', error)
      });
    }
  }

  updateQuantity(productId: number, change: number) {
    if (!this.cart) return;

    const item = this.cart.items.find(i => i.id === productId && i.userId === this.loggedInUserId);
    const product1 = this.products.find((p: Product) => p.id === productId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity <= 0) {
        this.removeItem(productId);
      } else {
        if ((product1?.quantity as number) >= newQuantity) {
          item.quantity = newQuantity;
          this.updateCart(this.cart);
        }
      }
    } else if (change > 0) {
      this.addToCart(productId);
    }
  }

  removeItem(productId: number) {
    if (!this.cart) return;
    const index = this.cart.items.findIndex(i => i.id === productId && i.userId === this.loggedInUserId);
    if (index !== -1) {
      this.cart.items.splice(index, 1);
      this.updateCart(this.cart);
    }
  }

  private updateCart(cart: Cart) {
    if (cart.id === 0) return; // Skip if cart hasn't been created on the server
    this.http.put(`http://localhost:3000/cart/${cart.id}`, cart).subscribe({
      next: () => console.log('Cart updated successfully'),
      error: (error) => console.error('Error updating cart:', error)
    });
  }

  logout() {
    //  localStorage.removeItem("token");
    this.appStateService.setUserDetails(null)
    this.appStateService.setToken(null)
    this.router.navigate(['/home']);
    //  window.location.reload();
  }
}
