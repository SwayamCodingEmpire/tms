import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { TopicService } from '../../../services/admin/topic.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-topics',
  standalone: false,
  templateUrl: './topics.component.html',
  styleUrl: './topics.component.scss'
})
export class TopicsComponent {
  pageSizeOptions: number[] = [5, 10, 15, 20];
  fileViewSelected: number | null = null;
  originalTopics: any[] = [];
  topics: any[] = [];
  currentPage = 1;
  pageSize = 10;
  sortedColumn: string = '';
  isAscending: boolean = true;
  editingIndex: number | null = null;
  topicForm!: FormGroup;
  searchForm!: FormGroup;
  pageSizeForm!: FormGroup;
  contentForm!: FormGroup;
  summaryForm!: FormGroup;
  isContentPopupOpen = false;
  isSummaryPopupOpen = false;
  popupPosition = { top: 0, left: 0 };
  hoveredIndex: number | null = null;
  deleteModal: any;
  topicIndexToDelete: number | null = null;
  topicToShowFiles: number | null = null;
  isAddingNewTopic = false;
  tempNewTopic: any = null;
  fileModal: any;
  showFileModal: any;
  courseCode: string | null = null;
  courseName: string | null = null;
totalPages = Math.ceil(this.topics.length / this.pageSize);

  constructor(
    private topicService: TopicService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    console.log('Topics initialized');
  }

  ngAfterViewInit() {
    console.log('jlfzsjdsgd');
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(el => new bootstrap.Tooltip(el));
    console.log('jlfzsjdsgd');
    setTimeout(() => {
      console.log('jlfzsjdsgd');
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

      // Initialize the delete modal
      this.deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal')!);
      this.showFileModal = new bootstrap.Modal(document.getElementById('showFileModal')!);
      console.log('jlfzsjdsgd');
      console.log('showFileModal element found:', this.showFileModal);
    }, 1000);
  }

  ngOnInit(): void {
    this.courseCode = this.route.snapshot.paramMap.get('code');
    this.courseName = this.route.snapshot.paramMap.get('name');
    console.log('Topics ngOnInit called');
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

      this.fileModal = new bootstrap.Modal(document.getElementById('fileUploadModal')!);
      this.showFileModal = new bootstrap.Modal(document.getElementById('showFileModal')!);
    }, 500);
  }

  private initializeForms() {
    // Main course form for editing
    this.topicForm = this.fb.group({
      topicName: ['', Validators.required],
      theoryTime: ['0 hr', Validators.required],
      practiceTime: ['0 hr', Validators.required],
      summary: ['', [Validators.required, Validators.maxLength(40)]],
      content: ['', [Validators.required, Validators.maxLength(100)]],
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
    this.summaryForm = this.fb.group({
      summary: ['', [Validators.required, Validators.maxLength(40)]]
    });

    this.contentForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(600)]]
    });
  }

  loadCourses() {
    this.topicService.getTopics().subscribe((data) => {
      this.originalTopics = data;
      this.topics = [...this.originalTopics];

      // Restore any search filtering that was applied
      if (this.searchForm.get('searchTerm')?.value) {
        this.filterCourses();
      }

      this.totalPages = Math.ceil(this.topics.length / this.pageSize);
    });
  }

  // onPageChange(event: PageEvent): void {
  //   this.pageSize = event.pageSize;
  //   this.currentPage = event.pageIndex;
  //   this.loadCourses();
  // }


  filterCourses() {
    this.currentPage = 1;
    const searchTerm = this.searchForm.get('searchTerm')?.value;

    if (!searchTerm || searchTerm.trim() === '') {
      // If search term is empty, show all courses
      this.topics = [...this.originalTopics];
    } else {
      // Filter courses based on search term
      this.topics = this.originalTopics.filter(course =>
        course.topicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.theoryTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.practiceTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }




  // goToFirstPage() {
  //   this.currentPage = 1;
  // }

  // goToLastPage() {
  //   this.currentPage = this.totalPages;
  // }

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
    this.totalPages = Math.ceil(this.topics.length / this.pageSize);
    this.currentPage = 1;
  }

  addRow() {
    this.isAddingNewTopic = true;

    // Create a temporary course object
    this.tempNewTopic = {
      topicName: "",
      theoryTime: "",
      practiceTime: "",
      summary: "",
      content: ""
    };

    // Add the temporary course to the beginning of the array
    this.topics.unshift(this.tempNewTopic);

    // Start editing the new course
    this.editingIndex = 0;

    // Reset the form with default values
    this.topicForm.reset({
      topicName: "",
      theoryTime: "",
      practiceTime: "",
      summary: "",
      content: "",
    });

    // Make sure we're on the first page to see the new row
    this.currentPage = 1;
  }

  sortTable(column: string, ascending: boolean) {
    this.sortedColumn = column;
    this.isAscending = ascending;
    this.topics.sort((a: any, b: any) => {
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
    const topic = this.topics[index];

    console.log('Editing course:', topic);
    console.log('Editing index:', index);
    console.log('Editing summary:', topic.summary);
    // Set form values from the selected course
    this.topicForm.setValue({
      topicName: topic.topicName,
      theoryTime: topic.theoryTime,
      practiceTime: topic.practiceTime,
      summary: topic.summary,
      content: topic.content,
    });

    console.log('Editing course:', topic);
  }

  saveCourse(index: number) {
    if (this.topicForm.valid) {
      const formValue = this.topicForm.value;
      const updatedCourse = {
        ...formValue,
        topics: formValue.topicsString
          ? formValue.topicsString.split(',').map((topic: string) => topic.trim()).filter((topic: string) => topic !== '')
          : []
      };

      if (this.isAddingNewTopic && index === 0) {
        // Adding a new course
        this.topicService.addTopics(updatedCourse).subscribe(() => {
          this.isAddingNewTopic = false;
          this.cancelEdit();
          this.loadCourses(); // Reload all courses from service
        }, (error) => {
          console.error('Error adding course:', error);
          // Handle error case
          this.loadCourses(); // Reload to restore original state
        });
      } else {
        // Updating an existing course
        const courseId = this.topics[index].id;
        this.topicService.updateTopics(courseId, updatedCourse).subscribe(() => {
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
    if (this.isAddingNewTopic) {
      // Remove the temporary new course
      this.topics.shift();
      this.isAddingNewTopic = false;
      this.loadCourses(); // Refresh the table
    }

    this.editingIndex = null;
    this.topicForm.reset();
  }

  deleteCourse(index: number) {
    this.topicIndexToDelete = index;
    const topicName = this.topics[index].topicName;

    // Set the course code in the modal
    const courseCodeElement = document.getElementById('topicToDelete');
    if (courseCodeElement) {
      console.log('Setting course code in modal:', topicName);
      courseCodeElement.textContent = `${topicName}`;
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
    if (this.topicIndexToDelete !== null) {
      const courseId = this.topics[this.topicIndexToDelete].id;
      this.topicService.deleteTopic(courseId).subscribe(() => {
        this.topicIndexToDelete = null;
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
    console.log('Opening description popup for course:', course);
    this.summaryForm.get('summary')?.setValue(course.summary);
    this.isSummaryPopupOpen = true;

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

  openContentPopup(event: MouseEvent, course: any) {
    console.log('Opening description popup for course:', course);
    console.log('Opening description popup for course:', course.content);
    this.contentForm.get('content')?.setValue(course.content);
    this.isContentPopupOpen = true;

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
    this.isSummaryPopupOpen = false;
  }

  closeContentPopup() {
    this.isContentPopupOpen = false;
  }

  saveSummary() {
    if (this.editingIndex !== null && this.summaryForm.valid) {
      const description = this.summaryForm.get('summary')?.value.trim();
      if (description) {
        this.topics[this.editingIndex].summary = description;
        // Also update the description in the course form
        this.topicForm.get('summary')?.setValue(description);
      }
    }
    const modal = bootstrap.Modal.getInstance(document.getElementById('editDescriptionModal')!);
    modal?.hide();
  }

  saveContent(){
    if (this.editingIndex !== null && this.contentForm.valid) {
      const description = this.contentForm.get('content')?.value.trim();
      if (description) {
        this.topics[this.editingIndex].content = description;
        // Also update the description in the course form
        this.topicForm.get('content')?.setValue(description);
      }
    }
    const modal = bootstrap.Modal.getInstance(document.getElementById('editContentModal')!);
    modal?.hide();
  }

  drop(event: CdkDragDrop<any[]>) {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const pagedItems = this.topics.slice(startIndex, startIndex + this.pageSize);

    // Move the item within the paged slice
    moveItemInArray(pagedItems, event.previousIndex, event.currentIndex);

    // Reflect the changes in the original array
    for (let i = 0; i < pagedItems.length; i++) {
      this.topics[startIndex + i] = pagedItems[i];
    }
  }

  showUploader = false;

  onUploadModalClose(): void {
    this.showUploader = false;
  }

  onUploadComplete(fileData: any): void {
    console.log('Uploaded File:', fileData);
    // You can store the file info, send it to a server, etc.
    this.showUploader = false;
  }

  showFiles(index: number) {
    this.fileViewSelected = index;
    console.log('Showing files for topic index:', index);
    this.topicToShowFiles = index;
    const files = this.topics[index].files;

    // Set the course code in the modal

    console.log('Showing files for topic index:', index);
    // Show the modal
    this.showFileModal.show();

    console.log('Showing files for topic index:', index);
    // // Add event listener to the confirm button
    // const confirmBtn = document.getElementById('confirmSaveButton');
    // if (confirmBtn) {
    //   console.log('Showing files for topic index:', index);
    //   // Remove any existing event listeners
    //   confirmBtn.replaceWith(confirmBtn.cloneNode(true));

    //   // Add new event listener
    //   document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
    //     console.log('File Changes saved' + files)
    //   });
    // }
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.topics.length / this.pageSize);
  }

  // Navigate to first page
  goToFirstPage(): void {
    this.currentPage = 1;
  }

  goToNextPage(): void {
    console.log('Total pages:', this.totalPages);
    if (this.currentPage < this.totalPages) {
      console.log('Current page before increment:', this.currentPage);
      console.log('Total pages:', this.totalPages);
      this.currentPage++;
      // this.initializeTooltips();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      // this.initializeTooltips();
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
    // this.initializeTooltips();
  }

}
