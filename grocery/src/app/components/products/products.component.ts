import { Component } from '@angular/core';
import { Product } from '../../models/product.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { WishlistService } from '../../services/wishlist.service';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  userId: string;
  imgLink:string;
}

interface Cart {
  id: number;
  userId: string;
  items: CartItem[];
}

@Component({
  selector: 'app-products',
  imports: [NgIf,NgFor,NgClass,RouterLink,FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: string = '';
  loggedInUserId: string | null = null;
  cart: Cart | null = null; // Track cart locally
  wishlist:Product[] = [];
  searchString:string="";

  constructor(
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private appStateService:AppStateService,
  ) {}

  ngOnInit() {
    // this.loggedInUserId = localStorage.getItem("loggedInUserId");
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || 'All';
      

      
      if (this.loggedInUserId) {
        this.loadCart();
        this.loadWishlist();
      }
    });
    this.appStateService.products$.subscribe((products)=>{
      this.products=products!;
      this.filterProducts()

    })
  }
  get filteredProductsBySearch() {
    return this.filteredProducts.filter((product: Product) => {
      return product.name.toLowerCase().includes(this.searchString.toLowerCase());
    });
  }
  loadWishlist() {
    this.wishlistService.getWishlist().subscribe((data) => {
      this.wishlist = (data || []).filter(item => !item.movedToCart);
    });
  }
  
 

  filterProducts(): void {
    if (this.selectedCategory === 'All') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product => product.category.toLowerCase() === this.selectedCategory.toLowerCase());
    }
  }

  loadCart() {
    this.http.get<Cart[]>(`http://localhost:3000/cart?userId=${this.loggedInUserId}`).subscribe({
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
    return !!this.loggedInUserId;
  }

  getQuantityInCart(productId: number): number {
      if (!this.cart) return 0;
      const item = this.cart.items.find(i => i.id === productId && i.userId === this.loggedInUserId);
      return item ? item.quantity : 0;
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
        userId: this.loggedInUserId,
        imgLink:product.imgLink
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
          if((product1?.quantity as number)>=newQuantity){
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

    toggleWishlist(product: Product) {
      if (!this.loggedInUserId) {
        alert('Please login first to add to wishlist!');
        this.router.navigate(['/login']);
        return;
      }
    
      const isAlreadyInWishlist = this.isInWishlist(product);
      
      if (isAlreadyInWishlist) {
        alert(`${product.name} is already in your Wishlist!`);
        return;
      }
    
      this.wishlistService.addToWishlist(product).subscribe(() => {
        this.loadWishlist(); // Refresh wishlist
        alert(`${product.name} added to Wishlist!`);
      });
    }
  
  // Check if a product is in wishlist
  isInWishlist(product: Product): boolean {
    return !!this.wishlist.some(p => p.id === product.id);
  }
  
  // Remove from wishlist
  removeFromWishlist(productId: number) {
    this.wishlistService.removeFromWishlist(productId).subscribe(() => {
      this.loadWishlist(); // Refresh wishlist
    });
  }
  
  
    
    logout() {
      localStorage.removeItem("loggedInUserId");
      localStorage.removeItem("userDetails");
      this.router.navigate(['/home']);
      window.location.reload();
    }
}
