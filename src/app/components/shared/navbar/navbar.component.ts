import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  isDropdownOpen = false;
  userName: string = '';
  userInitials: string = '';
  option: boolean = false;
  
  constructor(private router: Router) {
    // Subscribe to router events to detect route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Check if current route is programs
      if (event.url === '/programs') {
        this.option = true;
      } else if (event.url === '/courses') {
        this.option = false;
      }
    });
  }

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
    
    // Check initial route
    if (this.router.url === '/programs') {
      this.option = true;
    } else if (this.router.url === '/courses') {
      this.option = false;
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
    console.log('Sign Out Clicked');
    localStorage.clear();
    window.location.reload();
  }

  isCoursesDropdownOpen = false;

  toggleCoursesDropdown() {
    this.isCoursesDropdownOpen = !this.isCoursesDropdownOpen;
  }
}
