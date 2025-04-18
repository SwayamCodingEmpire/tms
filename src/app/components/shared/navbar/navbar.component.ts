import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  isDropdownOpen = false;

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
    console.log('Sign Out Clicked');
    localStorage.clear();
    window.location.reload();
  }

  isCoursesDropdownOpen = false;

toggleCoursesDropdown() {
  this.isCoursesDropdownOpen = !this.isCoursesDropdownOpen;
}

  // closeDropdown(event: Event) {
  //   if (!(event.target as HTMLElement).closest('#userDropdown')) {
  //     this.isDropdownOpen = false;
  //   }
  // }

}
