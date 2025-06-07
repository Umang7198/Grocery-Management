import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-changepassword',
  imports: [RouterLink,FormsModule,CommonModule],
  templateUrl: './changepassword.component.html',
  styleUrl: './changepassword.component.css'
})
export class ChangepasswordComponent {
  userId: string | null = null;
  currentPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  loggedInUserId: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}
  get isLoggedIn(): boolean {
    return !!this.loggedInUserId;
  }
  logout() {
    localStorage.removeItem("loggedInUserId");
    localStorage.removeItem("userDetails");
    this.router.navigate(['/home']);
    window.location.reload();
  }
  ngOnInit() {
    // Retrieve the logged-in user's ID from localStorage
    this.userId = localStorage.getItem('loggedInUserId');
    if (!this.userId) {
      // Redirect to login if no user is logged in
      this.router.navigate(['/login']);
    }
  }

  
  changePassword() {
        if (!this.userId) return;

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  if (!passwordRegex.test(this.newPassword)) {
      alert("Password must have at least one uppercase letter, one number, one special character, and be at least 6 characters long.");
      return ;
  }


    // Fetch the current user's data from the JSON server
    this.http.get<any>(`http://localhost:3000/users/${this.userId}`).subscribe({
      next: (user) => {
        // Verify the current password
        if (user.password !== this.currentPassword) {
          this.errorMessage = 'Current password is incorrect.';
          this.successMessage = '';
          return;
        }

        // Check if new passwords match
        if (this.newPassword !== this.confirmNewPassword) {
          this.errorMessage = 'New passwords do not match.';
          this.successMessage = '';
          return;
        }

        // Update the password via PATCH request
        this.http.patch(`http://localhost:3000/users/${this.userId}`, { password: this.newPassword }).subscribe({
          next: () => {
            this.successMessage = 'Password changed successfully.';
            this.errorMessage = '';
            // Optional: Clear the form
            this.currentPassword = '';
            this.newPassword = '';
            this.confirmNewPassword = '';
          },
          error: () => {
            this.errorMessage = 'Failed to change password. Please try again.';
            this.successMessage = '';
          }
        });
      },
      error: () => {
        this.errorMessage = 'Failed to fetch user data.';
        this.successMessage = '';
      }
    });
  }

}
