import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-batches',
  standalone: false,
  templateUrl: './batches.component.html',
  styleUrl: './batches.component.scss'
})
export class BatchesComponent {
  rootForm!: FormGroup;
  searchForm!: FormGroup;
  studentsList = ['Mohit Singh','Neha Mohan','Alice','Bob','Charlie','David Johnson','Emma Watson','Frank Turner','Grace Lee','Harry Potter','Irene Adler','Jack Ryan','Kelly Chen','Luis Garcia','Mike Ross','Nina Patel','Oscar Martinez','Priya Sharma','Quincy Adams','Rachel Green'];
  coursesList  = ['PHP Basics','Data Visualisation','Angular','React'];
  teachersList = ['Tushita Shekhar','Neha Samal','Ranjana Singh','Saurabh Sinha'];

  // Student selection modal properties
  showStudentModal = false;
  studentModalTop = 0;
  studentModalLeft = 0;
  studentModalWidth = 300;
  filteredStudents: string[] = [];
  selectedStudents: { [key: string]: boolean } = {};
  studentSearchTerm = '';
  activeStudentBatchIndex: number | null = null;
  activeProgramIndex: number = 0;

  @ViewChild('studentEditModal') studentEditModal!: ElementRef;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // If the student modal is shown and the click is outside the modal, close it and save
    if (this.showStudentModal) {
      if (this.studentEditModal && !this.studentEditModal.nativeElement.contains(event.target)) {
        this.saveStudents();
        this.closeStudentModal();
      }
    }
  }

  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Sorting properties
  sortedColumn = 'batchCode';
  isAscending = true;

  // Track for new batch adding
  isAddingNewBatch = false;
  originalValues: { [key: number]: any } = {};

  initialBatches: BatchData[] = [
    {
      batchCode: '1D2125', batchName: 'Batch 1', batchStartDate: '2023-01-01',
      programs: [
        {
          programCode: '1D2125', programName: 'PHP',
          students: ['Mohit Singh'],
          courses: [
            { courseCode: '1D2125', courseName: 'PHP Basics', teacher: 'Tushita Shekhar' },
            { courseCode: '2E2124', courseName: 'Data Visualisation', teacher: 'Neha Samal' }
          ]
        },
        {
          programCode: '2E2124', programName: 'React',
          students: ['Neha Mohan'],
          courses: [
            { courseCode: '3F3345', courseName: 'React Basics', teacher: 'Ranjana Singh' }
          ]
        }
      ]
    }
  ];

  ngOnInit() {
    this.rootForm = new FormGroup({ batches: new FormArray([]) });
    this.searchForm = new FormGroup({
      searchTerm: new FormControl('')
    });

    this.initialBatches.forEach(b => this.loadBatch(b));
    this.updateTotalPages();

    // Configure search
    this.searchForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(term => {
        this.searchBatches(term);
      });

    this.filteredStudents = [...this.studentsList];
  }

  /** FormArray getters **/
  get batches() { return this.rootForm.get('batches') as FormArray; }
  programs(bi: number) { return (this.batches.at(bi) as FormGroup).get('programs') as FormArray; }
  courses(bi: number, pi: number) { return this.programs(bi).at(pi).get('courses') as FormArray; }

  /** Create factories **/
  private createBatchGroup() {
    return new FormGroup({
      batchCode: new FormControl('', [Validators.required]),
      batchName: new FormControl('', [Validators.required]),
      batchStartDate: new FormControl('', [Validators.required]),
      editing: new FormControl(true),
      showDetails: new FormControl(false),
      programEditing: new FormControl(false),
      programs: new FormArray([])
    });
  }
  private createProgramGroup() {
    return new FormGroup({
      programCode: new FormControl(''),
      programName: new FormControl(''),
      students: new FormArray([]),
      selectedStudents: new FormControl<string[]>([]),
      editing: new FormControl(true),
      courses: new FormArray([])
    });
  }
  private createCourseGroup() {
    return new FormGroup({
      courseCode: new FormControl(''),
      courseName: new FormControl(''),
      teacher: new FormControl(''),
      editing: new FormControl(true)
    });
  }

  /** Load static data **/
  private loadBatch(data: BatchData) {
    const bg = this.createBatchGroup();
    bg.patchValue({
      batchCode: data.batchCode,
      batchName: data.batchName,
      batchStartDate: data.batchStartDate
    });
    bg.get('editing')!.setValue(false);

    const pa = bg.get('programs') as FormArray;
    data.programs.forEach(p => {
      const pg = this.createProgramGroup();
      pg.patchValue({
        programCode: p.programCode,
        programName: p.programName,
        selectedStudents: p.students
      });
      pg.get('editing')!.setValue(false);

      // students
      const sa = pg.get('students') as FormArray;
      p.students.forEach(s => sa.push(new FormControl(s)));

      // courses
      const ca = pg.get('courses') as FormArray;
      p.courses.forEach(c => {
        const cg = this.createCourseGroup();
        cg.patchValue({ courseCode: c.courseCode, courseName: c.courseName, teacher: c.teacher });
        cg.get('editing')!.setValue(false);
        ca.push(cg);
      });

      pa.push(pg);
    });

    this.batches.push(bg);
    this.updateTotalPages();
  }

  // Student Selection Modal Methods
  openStudentsModal(event: MouseEvent, batchIndex: number, programIndex: number = 0): void {
    // Stop propagation to prevent document:click from immediately closing the modal
    event.stopPropagation();

    this.activeStudentBatchIndex = batchIndex;
    this.activeProgramIndex = programIndex;

    // Reset selection states based on the selected students
    this.selectedStudents = {};

    // Access the specified program of the batch
    const batch = this.batches.at(batchIndex) as FormGroup;
    const programsArray = batch.get('programs') as FormArray;

    if (programsArray.length > 0) {
      const program = programsArray.at(programIndex) as FormGroup;
      const selectedStudents = program.get('selectedStudents')?.value || [];

      selectedStudents.forEach((student: string) => {
        this.selectedStudents[student] = true;
      });
    }

    this.studentSearchTerm = '';
    this.filterStudents();

    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    this.studentModalWidth = 300;
    this.studentModalTop = rect.bottom + window.scrollY;
    this.studentModalLeft = rect.left + window.scrollX;

    this.showStudentModal = true;
  }

  closeStudentModal(): void {
    if (this.showStudentModal) {
      this.showStudentModal = false;
    }
  }

  saveStudents(): void {
    if (this.activeStudentBatchIndex !== null) {
      const batch = this.batches.at(this.activeStudentBatchIndex) as FormGroup;
      const programsArray = batch.get('programs') as FormArray;

      if (programsArray.length > 0) {
        const program = programsArray.at(this.activeProgramIndex) as FormGroup;
        const selectedStudentsList = Object.keys(this.selectedStudents)
          .filter(student => this.selectedStudents[student]);

        // Update the selectedStudents control
        program.get('selectedStudents')?.setValue(selectedStudentsList);

        // Also update the students FormArray
        const studentsArray = program.get('students') as FormArray;
        studentsArray.clear();
        selectedStudentsList.forEach(student => {
          studentsArray.push(new FormControl(student));
        });
      }

      this.closeStudentModal();
      this.activeStudentBatchIndex = null;
    }
  }

  filterStudents(): void {
    if (!this.studentSearchTerm.trim()) {
      this.filteredStudents = [...this.studentsList];
    } else {
      const term = this.studentSearchTerm.toLowerCase();
      this.filteredStudents = this.studentsList.filter(student =>
        student.toLowerCase().includes(term)
      );
    }
  }

  toggleStudentSelection(student: string): void {
    this.selectedStudents[student] = !this.selectedStudents[student];
  }

  isAllStudentsSelected(): boolean {
    return this.filteredStudents.length > 0 &&
      this.filteredStudents.every(student => this.selectedStudents[student]);
  }

  toggleSelectAllStudents(): void {
    const allSelected = this.isAllStudentsSelected();
    this.filteredStudents.forEach(student => {
      this.selectedStudents[student] = !allSelected;
    });
  }

  /** Batch actions **/
  addBatch() {
    this.isAddingNewBatch = true;
    this.batches.push(this.createBatchGroup());
    // Go to the page where the new batch is
    this.goToLastPage();
  }

  toggleDetails(i: number) {
    const batch = this.batches.at(i) as FormGroup;
    const currentValue = batch.get('showDetails')?.value;

    // If we're toggling from closed to open, reset programs and add an empty one in edit mode
    if (!currentValue) {
      // Clear existing programs array
      const programsArray = batch.get('programs') as FormArray;
      programsArray.clear();

      // Add a new empty program in edit mode
      this.addProgram(i);
      batch.get('programEditing')?.setValue(true);
    }

    batch.get('showDetails')?.setValue(!currentValue);
  }

  saveBatch(i: number) {
    // Validate required fields
    const batch = this.batches.at(i) as FormGroup;
    if (batch.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(batch.controls).forEach(key => {
        batch.get(key)?.markAsTouched();
      });
      return;
    }

    batch.get('editing')!.setValue(false);
    this.isAddingNewBatch = false;
    delete this.originalValues[i];
  }

  editBatch(i: number) {
    // Store original values for cancellation
    this.originalValues[i] = {
      batchCode: this.batches.at(i).get('batchCode')?.value,
      batchName: this.batches.at(i).get('batchName')?.value,
      batchStartDate: this.batches.at(i).get('batchStartDate')?.value
    };

    this.batches.at(i).get('editing')!.setValue(true);
  }

  removeBatch(i: number) {
    this.batches.removeAt(i);
    this.updateTotalPages();

    // If current page is now empty, go to the last page
    const startItem = (this.currentPage - 1) * this.pageSize;
    if (startItem >= this.batches.length && this.currentPage > 1) {
      this.currentPage--;
    }
  }

  cancelEdit(i: number) {
    const batch = this.batches.at(i);

    // If it's a new batch being added
    if (this.isAddingNewBatch && !this.originalValues[i]) {
      this.batches.removeAt(i);
      this.isAddingNewBatch = false;
      this.updateTotalPages();
      return;
    }

    // Restore original values
    if (this.originalValues[i]) {
      batch.patchValue(this.originalValues[i]);
      delete this.originalValues[i];
    }

    batch.get('editing')!.setValue(false);
    this.isAddingNewBatch = false;
  }

  /** Program actions **/
  addProgram(bi: number) {
    this.batches.at(bi).get('programEditing')?.setValue(true);
    this.batches.at(bi).get('showDetails')?.setValue(true);
    this.programs(bi).push(this.createProgramGroup());
  }
  saveProgram(bi: number, pi: number) { this.programs(bi).at(pi).get('editing')!.setValue(false); }
  editProgram(bi: number, pi: number) { this.programs(bi).at(pi).get('editing')!.setValue(true); }
  removeProgram(bi: number, pi: number) { this.programs(bi).removeAt(pi); }
  onStudentSelect(ev: Event, bi: number, pi: number) {
    const fa = this.programs(bi).at(pi).get('students') as FormArray;
    fa.clear();
    Array.from((ev.target as any).selectedOptions)
      .map((o: any) => o.value)
      .forEach(v => fa.push(new FormControl(v)));
  }

  /** Course actions **/
  addCourse(batchIndex: number, programIndex: number): void {
    console.log('Adding course to batch:', batchIndex, 'program:', programIndex);
    const program = this.programs(batchIndex).at(programIndex);

    program.get('editing')?.setValue(true); // Set courseEditing true at program level
    program.get('showDetails')?.setValue(true);   // Expand program details

    const coursesArray = this.courses(batchIndex, programIndex);
    const newCourse = this.createCourseGroup();

    newCourse.get('editing')?.setValue(true);     // 🛠️ Set editing true for the new course itself

    coursesArray.push(newCourse);
  }

  saveCourse(bi: number, pi: number, ci: number) { this.courses(bi,pi).at(ci).get('editing')!.setValue(false); }
  editCourse(bi: number, pi: number, ci: number) { this.courses(bi,pi).at(ci).get('editing')!.setValue(true); }
  removeCourse(bi: number, pi: number, ci: number) { this.courses(bi,pi).removeAt(ci); }

  /** Pagination methods **/
  updateTotalPages() {
    this.totalPages = Math.ceil(this.batches.length / this.pageSize);
    if (this.totalPages === 0) this.totalPages = 1;
  }

  updatePagination() {
    this.updateTotalPages();
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  goToFirstPage() {
    this.currentPage = 1;
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToLastPage() {
    this.currentPage = this.totalPages;
  }

  /** Sorting method **/
  sortTable(column: string, ascending: boolean) {
    this.sortedColumn = column;
    this.isAscending = ascending;

    const batchesArray = this.batches.controls;

    batchesArray.sort((a, b) => {
      const valA = (a as FormGroup).get(column)?.value;
      const valB = (b as FormGroup).get(column)?.value;

      if (valA < valB) {
        return ascending ? -1 : 1;
      }
      if (valA > valB) {
        return ascending ? 1 : -1;
      }
      return 0;
    });

    // Re-add sorted controls back to the FormArray
    const sortedControls = [...batchesArray];
    this.batches.clear();
    sortedControls.forEach(control => this.batches.push(control));
  }

  /** Search method **/
  searchBatches(term: string) {
    // Reset to first page when searching
    this.currentPage = 1;

    // Implement search logic if needed
    // This would filter batches based on the search term
  }

  /** Delete confirmation modal **/
  openDeleteConfirmationModal(index: number): void {
    const batchCode = this.batches.at(index)?.get('batchCode')?.value;

    // Set the batch code in the confirmation message
    const batchCodeElement = document.getElementById('batchCodeToDelete');
    if (batchCodeElement) {
      batchCodeElement.textContent = batchCode ?? '';
    }

    // Show the modal
    const modalElement = document.getElementById('deleteConfirmationModal');
    if (!modalElement) return;

    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();

    // Set up confirm button click handler
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if (confirmBtn) {
      // Remove any existing event listeners by cloning
      const newConfirmBtn = confirmBtn.cloneNode(true) as HTMLElement;
      confirmBtn.parentNode?.replaceChild(newConfirmBtn, confirmBtn);

      // Add new event listener
      newConfirmBtn.addEventListener('click', () => {
        this.removeBatch(index);
        modal.hide();
      });
    }
  }


  /** Utility **/
  refresh() {
    this.isAddingNewBatch = false;
    this.ngOnInit();
    this.currentPage = 1;
  }

}

interface Course {
  courseCode: string;
  courseName: string;
  teacher: string;
}

interface Program {
  programCode: string;
  programName: string;
  students: string[];
  courses: Course[];
}

interface BatchData {
  batchCode: string;
  batchName: string;
  batchStartDate: string; // consider using Date if you prefer
  programs: Program[];
}

