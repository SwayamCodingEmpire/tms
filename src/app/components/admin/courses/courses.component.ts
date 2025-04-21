import { Component, Renderer2 } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { CourseServicesService } from '../../../services/admin/course/course-services.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-courses',
  standalone: false,
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent {

  originalCourses: any[] = [];
  courses: any[] = [];
  currentPage = 1;
  pageSize = 10;
  sortedColumn: string = '';
  isAscending: boolean = true;
  editingIndex: number | null = null;
  courseForm!: FormGroup;
  searchForm!: FormGroup;
  pageSizeForm!: FormGroup;
  descriptionForm!: FormGroup;
  isDescriptionPopupOpen = false;
  popupPosition = { top: 0, left: 0 };
  hoveredIndex: number | null = null;
  deleteModal: any;
  courseIndexToDelete: number | null = null;
  isAddingNewCourse = false;
  tempNewCourse: any = null;
totalPages = Math.ceil(this.courses.length / this.pageSize);

  constructor(
    private courseService: CourseServicesService,
    private fb: FormBuilder
  ) {
    console.log('CoursesComponent initialized');
  }

  ngOnInit(): void {
    console.log('CoursesComponent ngOnInit called');
    this.initializeForms();
    this.loadCourses();

    // Initialize search term change detection
    this.searchForm.get('searchTerm')?.valueChanges.subscribe(term => {
      this.filterCourses();
    });

    // Initialize page size change detection
    this.pageSizeForm.get('pageSize')?.valueChanges.subscribe(size => {
      this.pageSize = size;
    });

    // Initialize Bootstrap tooltips and modal
    setTimeout(() => {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

      // Initialize the delete modal
      this.deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal')!);
    }, 500);
  }

  private initializeForms() {
    // Main course form for editing
    this.courseForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      theoryTime: ['0 hr', Validators.required],
      practiceTime: ['0 hr', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(40)]],
      topicsString: ['']
    });

    // Search form
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });



    // Page size form
    this.pageSizeForm = this.fb.group({
      pageSize: [8, [Validators.required, Validators.min(1)]]
    });

    // Description popup form
    this.descriptionForm = this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(40)]]
    });
  }

  loadCourses() {
    this.courseService.getCourses().subscribe((data) => {
      this.originalCourses = data;
      this.courses = [...this.originalCourses];

      // Restore any search filtering that was applied
      if (this.searchForm.get('searchTerm')?.value) {
        this.filterCourses();
      }
      this.totalPages = Math.ceil(this.courses.length / this.pageSize);
    });
  }


  
  filterCourses() {
    this.currentPage = 1;
    const searchTerm = this.searchForm.get('searchTerm')?.value;

    if (!searchTerm || searchTerm.trim() === '') {
      // If search term is empty, show all courses
      this.courses = [...this.originalCourses];
    } else {
      // Filter courses based on search term
      this.courses = this.originalCourses.filter(course =>
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.topics.some((topic: string) => topic.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    this.initializeTooltips();
  }




  // goToFirstPage() {
  //   this.currentPage = 1;
  // }

  // goToLastPage() {
  //   this.currentPage = this.totalPages;
  // }

  initializeTooltips() {
    // Destroy existing tooltips
    const existingTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    existingTooltips.forEach(el => bootstrap.Tooltip.getInstance(el)?.dispose());

    // Initialize new tooltips
    setTimeout(() => {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      [...tooltipTriggerList].forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }, 0);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  onPageSizeChange() {
    this.totalPages = Math.ceil(this.courses.length / this.pageSize);
    this.currentPage = 1;
  }

  addRow() {
    this.isAddingNewCourse = true;

    // Create a temporary course object
    this.tempNewCourse = {
      code: "",
      name: "",
      theoryTime: "",
      practiceTime: "",
      description: "",
      topics: []
    };

    // Add the temporary course to the beginning of the array
    this.courses.unshift(this.tempNewCourse);

    // Start editing the new course
    this.editingIndex = 0;

    // Reset the form with default values
    this.courseForm.reset({
      code: "",
      name: "",
      theoryTime: "",
      practiceTime: "",
      description: "",
      topicsString: ""
    });

    // Make sure we're on the first page to see the new row
    this.currentPage = 1;
    this.initializeTooltips();
  }

  sortTable(column: string, ascending: boolean) {
    this.sortedColumn = column;
    this.isAscending = ascending;
    this.courses.sort((a: any, b: any) => {
      const valA = a[column].toString().toLowerCase();
      const valB = b[column].toString().toLowerCase();
      return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }

  resetTable() {
    this.loadCourses();
    this.sortedColumn = '';
    this.isAscending = true;
    this.pageSizeForm.get('pageSize')?.setValue(8);
    this.currentPage = 1;
    this.searchForm.get('searchTerm')?.setValue('');
  }

  getRemainingTopics(topics: string[]): string {
    return topics.slice(2)
                 .map((topic, index) => `${index + 1}. ${topic}`)
                 .join('\n');
  }

  editCourse(index: number) {
    this.editingIndex = index;
    const course = this.courses[index];

    // Set form values from the selected course
    this.courseForm.setValue({
      code: course.code,
      name: course.name,
      theoryTime: course.theoryTime,
      practiceTime: course.practiceTime,
      description: course.description,
      topicsString: course.topics.join(', ')
    });
  }

  saveCourse(index: number) {
    if (this.courseForm.valid) {
      const formValue = this.courseForm.value;
      const updatedCourse = {
        ...formValue,
        topics: formValue.topicsString
          ? formValue.topicsString.split(',').map((topic: string) => topic.trim()).filter((topic: string) => topic !== '')
          : []
      };

      if (this.isAddingNewCourse && index === 0) {
        // Adding a new course
        this.courseService.addCourse(updatedCourse).subscribe(() => {
          this.isAddingNewCourse = false;
          this.cancelEdit();
          this.loadCourses(); // Reload all courses from service
        }, (error) => {
          console.error('Error adding course:', error);
          // Handle error case
          this.loadCourses(); // Reload to restore original state
        });
      } else {
        // Updating an existing course
        const courseId = this.courses[index].id;
        this.courseService.updateCourse(courseId, updatedCourse).subscribe(() => {
          this.cancelEdit();
          this.loadCourses(); // Reload all courses from service
        }, (error) => {
          console.error('Error updating course:', error);
          // Handle error case
          this.loadCourses(); // Reload to restore original state
        });
      }
    }
  }

  cancelEdit() {
    if (this.isAddingNewCourse) {
      // Remove the temporary new course
      this.courses.shift();
      this.isAddingNewCourse = false;
      this.loadCourses(); // Refresh the table
    }

    this.editingIndex = null;
    this.courseForm.reset();
  }

  deleteCourse(index: number) {
    this.courseIndexToDelete = index;
    const courseCode = this.courses[index].code;
    const courseName = this.courses[index].name;

    // Set the course code in the modal
    const courseCodeElement = document.getElementById('courseCodeToDelete');
    if (courseCodeElement) {
      courseCodeElement.textContent = `${courseCode}/ ${courseName}`;
    }

    // Show the modal
    this.deleteModal.show();

    // Add event listener to the confirm button
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if (confirmBtn) {
      // Remove any existing event listeners
      confirmBtn.replaceWith(confirmBtn.cloneNode(true));

      // Add new event listener
      document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
        this.confirmDeleteCourse();
      });
    }
  }

  confirmDeleteCourse() {
    if (this.courseIndexToDelete !== null) {
      const courseId = this.courses[this.courseIndexToDelete].id;
      this.courseService.deleteCourse(courseId).subscribe(() => {
        this.courseIndexToDelete = null;
        this.deleteModal.hide();
        this.loadCourses(); // Reload courses after deletion
      }, (error) => {
        console.error('Error deleting course:', error);
        this.deleteModal.hide();
        this.loadCourses(); // Reload to restore original state
      });
    }
  }
  openDescriptionPopup(event: MouseEvent, course: any) {
    this.descriptionForm.get('description')?.setValue(course.description);
    this.isDescriptionPopupOpen = true;

    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    const popupWidth = 450; // Match with your .description-popup CSS width

    const shiftLeftBy = 160;
    this.popupPosition = {
      top: rect.bottom + scrollTop + 10, // space below element
      left: rect.left + scrollLeft + rect.width / 2 - popupWidth / 2 - shiftLeftBy // center horizontally
    };
  }




  closeDescriptionPopup() {
    this.isDescriptionPopupOpen = false;
  }

  saveDescription() {
    if (this.editingIndex !== null && this.descriptionForm.valid) {
      const description = this.descriptionForm.get('description')?.value.trim();
      if (description) {
        this.courses[this.editingIndex].description = description;
        // Also update the description in the course form
        this.courseForm.get('description')?.setValue(description);
      }
    }
    const modal = bootstrap.Modal.getInstance(document.getElementById('editDescriptionModal')!);
    modal?.hide();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.courses.length / this.pageSize);
  }

  // Navigate to first page
  goToFirstPage(): void {
    this.currentPage = 1;
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.initializeTooltips();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.initializeTooltips();
    }
  }


  // Navigate to last page
  goToLastPage(): void {
    this.currentPage = this.totalPages;
  }

  // Update pagination when page size changes
  updatePagination(): void {
    this.calculateTotalPages();
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    this.initializeTooltips();
  }

  hideTooltip(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const tooltip = bootstrap.Tooltip.getInstance(target);
    if (tooltip) {
      tooltip.hide();
    }
}
}

