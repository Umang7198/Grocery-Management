import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { WishlistService } from '../../services/wishlist.service';
import { AppStateService } from '../../services/app-state.service';
import { User } from '../../models/user.model';
import { Cart } from '../../models/cart.model';

import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterOutlet, RouterLink, NgClass, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  selectedCategory: string = 'All';
  products: Product[] = [];
  searchString: string = '';
  userName: string = "Guest";
  loggedInUserId: string | null = null;
  carts: Cart | null = null; // Track cart locally
  wishlist: Product[] = [];
  userDetails: User | null = null;
  token: string | null = null;

  categories = [
    {
      "id": 1,
      "name": "Fruit",
      "imgLink": "https://th.bing.com/th/id/R.8558e156de448a280d489af540af7700?rik=8xc66llq3q8hlQ&riu=http%3a%2f%2fpngimg.com%2fuploads%2fapple%2fapple_PNG12405.png&ehk=1QYlrxUD9Canji%2bd6Al3MZZvDH%2fdl1MuChmNOHoG4Ig%3d&risl=1&pid=ImgRaw&r=0"
    },
    {
      "id": 2,
      "name": "Dairy",
      "imgLink": "https://th.bing.com/th/id/R.8558e156de448a280d489af540af7700?rik=8xc66llq3q8hlQ&riu=http%3a%2f%2fpngimg.com%2fuploads%2fapple%2fapple_PNG12405.png&ehk=1QYlrxUD9Canji%2bd6Al3MZZvDH%2fdl1MuChmNOHoG4Ig%3d&risl=1&pid=ImgRaw&r=0"
    },
    {
      "id": 3,
      "name": "Bakery",
      "imgLink": "https://th.bing.com/th/id/R.8558e156de448a280d489af540af7700?rik=8xc66llq3q8hlQ&riu=http%3a%2f%2fpngimg.com%2fuploads%2fapple%2fapple_PNG12405.png&ehk=1QYlrxUD9Canji%2bd6Al3MZZvDH%2fdl1MuChmNOHoG4Ig%3d&risl=1&pid=ImgRaw&r=0"
    }
  ]

  constructor(
    private router: Router,
    private http: HttpClient,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
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

    if (this.userDetails?.id) {
      this.loadCart();
      this.loadWishlist();
    }

    this.appStateService.token$.subscribe((token) => {
      this.token = token;
    })

    this.appStateService.cart$.subscribe((carts) => {
      this.carts = carts;
    })


    if (!this.userDetails?.id) {
      this.userName = "Guest";
    } else {
      this.userName = this.userDetails!.name;
    }
    this.loadProducts();
  }

  loadWishlist() {
    this.wishlistService.getWishlist().subscribe((data) => {
      this.wishlist = (data || []).filter(item => !item.movedToCart);
    });
  }

  loadProducts(): void {
    this.http.get<Product[]>(`http://localhost:8080/api/getProducts`).subscribe((data: any) => {
      this.products = data.data;
      this.appStateService.setProducts(this.products)
    });
    // fetch(`http://localhost:8080/api/getProducts`,{
    //   method:"GET",
    //   headers:{
    //     Authorization:JSON.parse(localStorage.getItem("token") || '')
    //   }
    // }).then(async(response)=>{
    //   // this.products = response.json();
    //   console.log(await response.json())
    // })

  }

  loadCart() {
    this.http.get<Cart[]>(`http://localhost:3000/cart?userId=${this.userDetails?.id}`).subscribe({
      next: (cart) => {
        if (cart.length == 0) {
          fetch("http://localhost:3000/cart", {
            method: "POST",
            headers: {
              Authorization: this.token!
            },
            body: JSON.stringify({
              userId: this.userDetails?.id!,
              items: []
            })
          }).then((response) => {
            console.log(response)
            
          })

          this.appStateService.setCart({
            id: 101,
            userId: this.userDetails?.id!,
            items: []
          });

        } else {
          this.appStateService.setCart(cart[0]);
        }
      },
      error: (error) => console.error('Error fetching cart:', error)
    });


  }


  get isLoggedIn(): boolean {
    return !!this.userDetails?.id;
  }
  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.router.navigate(['/products'], { queryParams: { category: category } });
  }

  get filteredProducts() {
    return this.products.filter((product: Product) => {
      return product.name.toLowerCase().includes(this.searchString.toLowerCase());
    });
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
    return totalQunatity;
  }

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

    // const cartItem: Product = {
    //   id: product.id,
    //   name: product.name,
    //   price: product.price,
    //   quantity: 1,
    //   imgLink: product.imgLink
    // };

    //   if (this.carts!.length > 0) {
    //     const existingItem = this.carts!.find(item => item.productId === productId);
    //     if (existingItem) {
    //       // this.updateQuantity(productId, 1);

    //     } else {
    //       this.cart.items.push(cartItem);
    //       this.updateCart(this.cart);
    //       alert(`${product.name} added to cart!`);
    //     }
    //   } else {
    //     const newCart = { userId: this.loggedInUserId!, items: [cartItem] };
    //     this.http.post<Cart>('http://localhost:3000/cart', newCart).subscribe({
    //       next: (createdCart) => {
    //         this.cart = createdCart; // Update local cart with server-assigned ID
    //         alert(`${product.name} added to cart!`);
    //       },
    //       error: (error) => console.error('Error creating cart:', error)
    //     });
    //   }
  }

  updateQuantity(product: Product, change: number) {
    //   if (this.carts!.length > 0) return;

    //   const item = this.carts!.find(item => item.productId == productId);
    //   const product1 = this.products.find((product: Product) => product.id === productId);
    //   if (item) {
    //     const newQuantity = item.quantity + change;
    //     if (newQuantity <= 0) {
    //       this.removeItem(productId);
    //     } else {
    //       if ((product1?.quantity as number) >= newQuantity) {
    //         item.quantity = newQuantity;
    //         this.updateCart(this.cart);
    //       }
    //     }
    //   } else if (change > 0) {
    //     this.addToCart(productId);
    //   }

    if (change == 1) {
      this.carts?.items.push(product);
    }
    if (change == -1) {
      let index = this.carts?.items.findIndex((item) => item?.id == product.id);
      if ((index!) >= 0) this.carts?.items.splice(index!, 1)

    }
    this.appStateService.setCart(this.carts);
  }

  removeItem(productId: number) {
    // if (!this.cart) return;
    // const index = this.cart.items.findIndex(i => i.id === productId && i.userId === this.loggedInUserId);
    // if (index !== -1) {
    //   this.cart.items.splice(index, 1);
    //   this.updateCart(this.cart);
    // }
    // (!this.cart) return;

  }

  // private updateCart(cart: Cart) {
  //   if (cart.id === 0) return; // Skip if cart hasn't been created on the server
  //   this.http.put(`http://localhost:3000/cart/${cart.id}`, cart).subscribe({
  //     next: () => console.log('Cart updated successfully'),
  //     error: (error) => console.error('Error updating cart:', error)
  //   });
  // }


  toggleWishlist(product: Product) {
    if (!this.userDetails) {
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