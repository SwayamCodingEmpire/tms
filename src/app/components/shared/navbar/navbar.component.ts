import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  constructor(private router : Router) { }
  isDropdownOpen = false;
  userName: string = '';
  userInitials: string = '';
  option: boolean = false;

  

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.userName = user.user; // "user" key holds the full name

      const nameParts = this.userName.trim().split(/\s+/);
      let initials = '';
      for (let i = 0; i < nameParts.length; i++) {
        if (nameParts[i].length > 0) {
          initials += nameParts[i][0].toUpperCase();
        }
      }
      this.userInitials = initials;
    }
  }

  checkOption()
  {
    this.option = !this.option;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(event: Event) {
    if (!(event.target as HTMLElement).closest('#userDropdown')) {
      this.isDropdownOpen = false;
    }
  }

  changePassword() {
    console.log('Change Password Clicked');
  }
  signOut() {
    // Clear the session or any login-related data
    localStorage.removeItem('loggedIn'); // Remove login status
    localStorage.removeItem('authToken'); // If you're using a token (optional)
  
    // Navigate to the login page
    this.router.navigate(['/login']);
  }
  

  isCoursesDropdownOpen = false;

toggleCoursesDropdown() {
  this.isCoursesDropdownOpen = !this.isCoursesDropdownOpen;
}
handleOption(isProgram: boolean) {
  this.option = isProgram;             // Set the dropdown label
  this.isCoursesDropdownOpen = false; // Close the dropdown
}

}
