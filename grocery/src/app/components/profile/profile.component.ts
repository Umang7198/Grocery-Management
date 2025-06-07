import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule,RouterLink],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    loggedInUserId: string | null = null;
    user: any = { id: '', username: '', password: '', address: '', contact: '' };
    isEditing: boolean = false;
    userName:string=''
    constructor(private http: HttpClient, private router: Router) {}

    ngOnInit() {

        this.loggedInUserId = JSON.parse(localStorage.getItem('userDetails') || '').id;
        if(this.loggedInUserId){
            this.user=JSON.parse(localStorage.getItem('userDetails') ||'');
            console.log(this.user)
            this.userName = this.user.name;
        }
        // if (this.loggedInUserId) {
        //     this.http.get(`http://localhost:3000/users/?id=${this.loggedInUserId}`).subscribe({
        //         next: (user:any) => {
        //           this.user = user[0];
        //           this.userName=user[0].username
        //         },
        //         error: (error) => {
        //             console.error('Error fetching user:', error);
        //             alert('User not found. Please log in again.');
        //             this.router.navigate(['/login']);

        //         }
        //     });
            
        // } else {
        //     alert('Please log in to view your profile.');
        //     this.router.navigate(['/login']);
        // }
    }

    validateInput(username: string,address: string, contact: string): boolean {
        const nameRegex = /^[A-Za-z ]+$/;
        if (!nameRegex.test(username)) {
            alert("Customer Name must have alphabets only.");
            return false;
        }

       

        if (!address.trim()) {
            alert("Address cannot be blank.");
            return false;
        }

        const contactRegex = /^[6-9][0-9]{9}$/;
        if (!contactRegex.test(contact)) {
            alert("Contact number is Invalid.");
            return false;
        }
        return true;
    }

    enableEditing() {
        this.isEditing = true;
    }

    saveChanges() {
        if (!this.validateInput(this.user.name,  this.user.address, this.user.contactNumber)) {
            return;
        }
        console.log(this.user);
        this.http.put(`http://localhost:8080/api/update/${this.loggedInUserId}`, this.user,{headers:{Authorization:JSON.parse(localStorage.getItem("token") || '')}}).subscribe({
            next: () => {
                alert('Profile updated successfully!');
                this.isEditing = false;
            },
            error: (error) => {
                console.error('Error updating user:', error);
                alert('Update failed. Please try again.');
            }
        });
    }

    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("userDetails");

        this.router.navigate(['/home']);
    }
}