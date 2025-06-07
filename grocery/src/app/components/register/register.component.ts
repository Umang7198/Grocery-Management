import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user.model';
@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})




export class RegisterComponent {
    
    username: string = '';
    email: string = '';
    password: string = '';
    confirmPassword: string = '';
    address: string = '';
    mobile: string = '';
    role:string='customer';
    successMessage: string = '';
    showModal: boolean = false;

    constructor(private router: Router, private http: HttpClient) {}

    registerUser() {
        const newUser = {
            name: this.username,
            email: this.email,
            password: this.password,
            address: this.address,
            contactNumber: this.mobile,
            role:this.role
        };




        // this.http.get<{data : User[]}>('http://localhost:8080/api/getUsers').subscribe({
        //     next:(response)=>{
        //         const users : User[] = response.data;
        //         console.log(users)

                // const user1 = users.find(u=>u.email===this.email);
                // const user2 = users.find(u=>u.contact===this.mobile);
                // console.log(users);
                // if(user1 && user2){
                //     alert("Email and Mobile number is already used.")
                //     this.router.navigate(['/register'])
                // }
                // else if(user1){
                //     alert("User is already registered, please register with different Email.")
                //     this.router.navigate(['/register'])
                // }
                // else if(user2){
                //     alert("Mobile number is already used.")
                //     this.router.navigate(['/register'])
                // }
                // else{
                    this.http.post('http://localhost:8080/api/auth/signup', newUser).subscribe({
                        next: (response: any) => {
                            
                            alert("Registration Successfull!")
                            this.router.navigate(['/login']);
                        },
                        error: (error) => {
                            console.error('Error registering user:', error);
                            alert('Registration Failed. Please try again');
                        }                            
                    });
                
           
           
    
       
    }

    goToLogin() {
        this.router.navigate(['/login']);
    }
}