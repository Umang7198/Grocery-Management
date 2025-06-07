import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AppStateService } from '../../services/app-state.service';
import { User } from '../../models/user.model';

@Component({
    selector: 'app-login',
    standalone:true,
    imports:[CommonModule,FormsModule,RouterLink],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    email: string = '';
    password: string = '';
    errorMessage: string = '';
    loggedInUserId: string | null = null;


    constructor(private router: Router,
        private http:HttpClient,
        private appStateService: AppStateService

    ) {}

    login() {

        this.http.post<any>('http://localhost:8080/api/auth/login',{email:this.email,password:this.password}).subscribe({
            next:(response)=>{
                // const user = users.find(u=>u.email==this.email && u.password===this.password && u.role==='customer');
                // localStorage.setItem('userDetails',JSON.stringify(user))
                // console.log(users)
                console.log(response)
                this.appStateService.setUserDetails(response.data.user);
                this.appStateService.setToken(response.data.token);
                // localStorage.setItem('userDetails',JSON.stringify(response.data.user))
                // localStorage.setItem('token',JSON.stringify(response.data.token))

                this.router.navigate(['/home']);
                // if(user){
                //     localStorage.setItem('loggedInUserId',user.id);
                //     this.router.navigate(['/home']);
                // }else{
                //     this.errorMessage='Invalid Id or Password';
                // }
            },
            error:(error)=>{
                console.error('Error fetching users:',error);
                this.errorMessage='Login failed.Please try again.'
            }
        });

        
    }
    get isLoggedIn(): boolean {
        return !!this.loggedInUserId;
      }
}