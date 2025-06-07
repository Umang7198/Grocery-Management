import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product.model';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { User } from '../../models/user.model';
import { Cart } from '../../models/cart.model';





@Component({
  selector: 'app-wishlist',
  imports:[NgFor,NgIf,RouterLink],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  wishlist: Product[] = [];
  wishlistInCart: Product[] = [];
  carts: Cart | null = null; // Track cart locally
  loggedInUserId: string | null = null;
  products: Product[] = [];
  userDetails:User | null = null;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private wishlistService: WishlistService, 
    private cartService: CartService,
    private productService: ProductService,
    private http: HttpClient,
    private appStateService:AppStateService,
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

    
    // this.loadProducts();
    if (this.userDetails) {
      this.loadWishlist();
    }
  }
 
  loadProducts(): void {
    this.productService.getProducts().subscribe((data: Product[]) => {
      this.products = data;
      console.log(this.products)
    });
  }

  get isLoggedIn(): boolean {
    return !!this.loggedInUserId;
  }

  loadWishlist() {
    this.wishlistService.getWishlist().subscribe((data) => {
      this.wishlist = data || [];
      console.log(this.wishlist)
    });
  }
 
  isInWishlist(product: Product): boolean {
    return this.wishlist.some(item => item.id === product.id);
  }

  //  addToCart(productId: number) {
  //       if (!this.loggedInUserId) {
  //         alert('Please login first to add to cart!');
  //         this.router.navigate(['/login']);
  //         return;
  //       }
    
  //       const product = this.products.find((p: Product) => p.id === productId);
  //       if (!product) return;
    
  //       const cartItem: CartItem = {
  //         id: product.id,
  //         name: product.name,
  //         price: product.price,
  //         quantity: 1,
  //         userId: this.loggedInUserId
  //       };
    
  //         const newCart = { userId: this.loggedInUserId!, items: [cartItem] };
  //         this.http.post<Cart>('http://localhost:3000/cart', newCart).subscribe({
  //           next: (createdCart) => {
  //             this.cart = createdCart; // Update local cart with server-assigned ID
  //             alert(`${product.name} added to cart!`);
  //             this.removeFromWishlist(cartItem.id);
  //           },
  //           error: (error) => console.error('Error creating cart:', error)
  //         });
        
  //     }
 
  addToCart(product: Product) {
    if (!this.userDetails?.id) {
      alert('Please login first to add to cart!');
      this.router.navigate(['/login']);
      return;
    }

    // const product = this.products.find((p: Product) => p.id == productId);
    // if (!product) return;
    this.carts!.items = [...this.carts?.items!, product]
    this.appStateService.setCart(this.carts)

    return;
  }

  
  
  
  

  markAsMovedToCart(productId: number) {
    const wishlistItem = this.wishlist.find(item => item.id === productId);
    if (!wishlistItem) return;
  
    const updatedItem = { ...wishlistItem, movedToCart: true };
  
    this.http.put(`http://localhost:3000/wishlist/${productId}`, updatedItem).subscribe({
      next: () => {
        this.loadWishlist();
      },
      error: (error) => console.error('Error updating wishlist item:', error)
    });
  }
  
      removeFromWishlist(productId: number) {
        this.wishlistService.removeFromWishlist(productId).subscribe(() => {
          this.loadWishlist(); // Refresh wishlist
        });
      }
}
