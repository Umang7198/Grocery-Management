import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { CartComponent } from './components/cart/cart.component';
import { TransactionComponent } from './components/transactions/transactions.component';
import { ProductsComponent } from './components/products/products.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { ChangepasswordComponent } from './components/changepassword/changepassword.component';
// import { TransactionComponent } from './components/transactions/transactions.component';
// impoer RegisterComponent
export const routes: Routes = [
    { path:'',component:HomeComponent},
    { path:'home',component:HomeComponent},
    { path: 'products', component: ProductsComponent },
    { path:'login',component:LoginComponent},
    { path:'register',component:RegisterComponent},
    { path:'profile',component:ProfileComponent},
    { path:'cart',component:CartComponent},
    { path:'wishlist',component:WishlistComponent},
    { path:'transaction',component:TransactionComponent},
    { path:'changepwd',component:ChangepasswordComponent},
    // { path:}
];
