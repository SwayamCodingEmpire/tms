import { Component, ElementRef, ViewChild } from '@angular/core';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-programs',
  standalone: false,
  templateUrl: './programs.component.html',
  styleUrl: './programs.component.scss'
})
export class ProgramsComponent {

  courses: any[] = [
    { id: '1', code: '1D2125', name: 'PHP', theoryTime: '1 hr', practiceTime: '1 hr', description: 'Sit amet turpis et...', topics: ['PHP Basics', 'XML', 'Error Handling'] },
    { id: '2', code: '2E2124', name: 'BI', theoryTime: '2 hrs', practiceTime: '2 hrs', description: 'Sit amet turpis et...', topics: ['Analytics', 'Data Visualisation', 'Dashboards'] },
    { id: '3', code: '3F2126', name: 'Data Science', theoryTime: '3 hrs', practiceTime: '3 hrs', description: 'Sit amet turpis et...', topics: ['Machine Learning', 'Big Data', 'Business Acumen'] },
    { id: '4', code: '2E2128', name: 'Web Development', theoryTime: '6 hrs', practiceTime: '6 hrs', description: 'Sit amet turpis et...', topics: ['JavaScript', 'AJAX Development', 'HTML'] },
    { id: '5', code: '1F2125', name: 'MySQL', theoryTime: '3 hrs', practiceTime: '3 hrs', description: 'Sit amet turpis et...', topics: ['DDL', 'DML', 'Joins'] }
  ];

  topicModalTop: number = 0;
  topicModalLeft: number = 0;
  topicModalWidth: number = 200;
  currentPage = 1;
  pageSize = 10;
  sortedColumn: string = '';
  isAscending: boolean = true;
  editingIndex: number | null = null;
  editableCourse: any = {};
  isDescriptionPopupOpen = false;
  popupPosition = { top: 0, left: 0 };
  searchTerm: string = '';
  deleteModal: any;
  courseIndexToDelete: number | null = null;
  isAdd: boolean = false;
  totalPages = 1;
  showTopicModal = false;
  modalWidth = 0;
  modalPosition = { top: 0, left: 0 };

  availableTopics: string[] = [
    'PHP Basics', 'XML', 'Error Handling', 'Excel to my SQL', 'Meta',
    'Analytics', 'Data Visualisation', 'Dashboards', 'Machine Learning',
    'Big Data', 'Business Acumen', 'JavaScript', 'AJAX Development', 'HTML',
    'Variables and operators', 'External file', 'Sessions and Cookies',
    'XML Parsing', 'XSLT', 'DOM & SAX', 'NumPy', 'Pandas', 'Matplotlib',
    'Bitcoin', 'Ethereum', 'Smart Contracts', 'AWS', 'Azure', 'Google Cloud',
    'Network Security', 'Ethical Hacking', 'Cryptography', 'Neural Networks',
    'CNN', 'NLP', 'Docker', 'Kubernetes', 'Jenkins', 'Agile', 'Scrum',
    'Software Testing', 'CSS', 'React', 'Hadoop', 'Spark', 'Kafka', 'DDL', 'DML', 'Joins'
  ];

  selectedTopics: { [key: string]: boolean } = {};
  filteredTopics: string[] = [];
  topicSearchTerm: string = '';
  tempEditingIndex: number | null = null;

  @ViewChild('descriptionPopup') descriptionPopup!: ElementRef;

  ngOnInit(): void {
    this.calculateTotalPages();
    this.filteredTopics = [...this.availableTopics];

    setTimeout(() => {
      this.initializeTooltips();

      const deleteModalElement = document.getElementById('deleteConfirmationModal');
      if (deleteModalElement) {
        this.deleteModal = new bootstrap.Modal(deleteModalElement);
      }
    }, 500);
  }

  initializeTooltips(): void {
    // Remove existing tooltips first to prevent duplicates
    const existingTooltips = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    existingTooltips.forEach(el => {
      const instance = bootstrap.Tooltip.getInstance(el);
      if (instance) {
        instance.dispose();
      }
    });

    // Initialize new tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new bootstrap.Tooltip(tooltipTriggerEl, {
        trigger: 'hover',
        placement: 'bottom',
        customClass: 'custom-tooltip'
      });
    });

  }

  openTopicsModal(index: number, event: MouseEvent): void {
    this.tempEditingIndex = index;
    const course = this.courses[index];
    const triggerElement = event.currentTarget as HTMLElement;
    const recta = triggerElement.getBoundingClientRect();

    this.topicModalTop = recta.bottom + window.scrollY;
    this.topicModalLeft = recta.left + window.scrollX;
    this.topicModalWidth = recta.width;

    this.selectedTopics = {};
    course.topics.forEach((topic: string) => {
      this.selectedTopics[topic] = true;
    });

    this.topicSearchTerm = '';
    this.filterTopics();

    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.modalWidth = rect.width;
    this.modalPosition = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    };

    this.showTopicModal = true;
    this.initializeTooltips();
  }

  closeTopicModal(): void {
    this.showTopicModal = false;
    this.initializeTooltips();
  }

  saveTopics(): void {
    if (this.tempEditingIndex !== null) {
      const selectedTopicsList = Object.keys(this.selectedTopics)
        .filter(topic => this.selectedTopics[topic]);

      this.editableCourse.topics = selectedTopicsList;
      this.closeTopicModal();
      this.tempEditingIndex = null;
      this.initializeTooltips();
    }
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.courses.length / this.pageSize);
    this.initializeTooltips();
  }

  filterTopics(): void {
    if (!this.topicSearchTerm.trim()) {
      this.filteredTopics = [...this.availableTopics];
    } else {
      const term = this.topicSearchTerm.toLowerCase();
      this.filteredTopics = this.availableTopics.filter(topic =>
        topic.toLowerCase().includes(term)
      );
    }
    this.initializeTooltips();
  }

  toggleTopicSelection(topic: string): void {
    this.selectedTopics[topic] = !this.selectedTopics[topic];
    this.updateEditableTopics();
    this.initializeTooltips();
  }

  updateEditableTopics(): void {
    if (this.editableCourse) {
      this.editableCourse.topics = Object.keys(this.selectedTopics)
        .filter(topic => this.selectedTopics[topic]);
    }
    this.initializeTooltips();
  }

  sortTable(column: string, ascending: boolean): void {
    this.sortedColumn = column;
    this.isAscending = ascending;

    this.courses.sort((a, b) => {
      const valA = a[column];
      const valB = b[column];

      if (valA < valB) {
        return ascending ? -1 : 1;
      }
      if (valA > valB) {
        return ascending ? 1 : -1;
      }
      return 0;
    });
    this.initializeTooltips();
  }

  filterCourses(): void {
    if (!this.searchTerm.trim()) {
      this.calculateTotalPages();
    } else {
      const term = this.searchTerm.toLowerCase();
      this.courses = this.courses.filter(course =>
        course.code.toLowerCase().includes(term) ||
        course.name.toLowerCase().includes(term) ||
        (course.description && course.description.toLowerCase().includes(term))
      );
      this.currentPage = 1;
      this.calculateTotalPages();
    }
    this.initializeTooltips();
  }

  resetTable(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.sortedColumn = '';
    this.isAscending = true;
    this.calculateTotalPages();
    this.initializeTooltips();
  }

  addRow(): void {
    this.isAdd = true;
    this.editingIndex = this.courses.length;
    this.editableCourse = {
      id: (this.courses.length + 1).toString(),
      code: '',
      name: '',
      theoryTime: '',
      practiceTime: '',
      description: '',
      topics: []
    };
    this.courses.push({...this.editableCourse});
    this.calculateTotalPages();
    this.currentPage = this.totalPages;
    this.initializeTooltips();
  }

  editCourse(index: number): void {
    this.isAdd = false;
    this.editingIndex = index;
    this.editableCourse = {...this.courses[index]};

    this.selectedTopics = {};
    this.editableCourse.topics.forEach((topic: string) => {
      this.selectedTopics[topic] = true;
    });
    this.initializeTooltips();
  }

  saveCourse(index: number): void {
    this.courses[index] = {...this.editableCourse};
    this.editingIndex = null;
    this.editableCourse = {};
    this.initializeTooltips();
  }

  cancelEdit(): void {
    if (this.isAdd) {
      this.courses.pop();
      this.calculateTotalPages();
    }
    this.editingIndex = null;
    this.editableCourse = {};
    this.isAdd = false;
    this.initializeTooltips();
  }

  deleteCourse(index: number): void {
    this.courseIndexToDelete = index;
    if (this.deleteModal) {
      this.deleteModal.show();
    }
    this.initializeTooltips();
  }

  confirmDeleteCourse(): void {
    if (this.courseIndexToDelete !== null) {
      this.courses.splice(this.courseIndexToDelete, 1);
      this.calculateTotalPages();

      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }

      this.deleteModal.hide();
      this.courseIndexToDelete = null;
      this.initializeTooltips();
    }
    this.initializeTooltips();
  }

  openDescriptionPopup(event: MouseEvent, course: any): void {
    this.popupPosition = {
      top: event.clientY,
      left: event.clientX
    };
    this.isDescriptionPopupOpen = true;
    this.initializeTooltips();
  }

  closeDescriptionPopup(): void {
    this.isDescriptionPopupOpen = false;
    this.initializeTooltips();
  }

  saveDescription(): void {
    if (this.editingIndex !== null) {
      this.courses[this.editingIndex].description = this.editableCourse.description;
    }
          this.initializeTooltips();
  }

  getRemainingTopics(topics: string[]): string {
    return topics.slice(2).join(', ');
    this.initializeTooltips();
  }

  goToFirstPage(): void {
    this.currentPage = 1;
    this.initializeTooltips();
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;

    }
    this.initializeTooltips();
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
    this.initializeTooltips();
  }

  goToLastPage(): void {
    this.currentPage = this.totalPages;
    this.initializeTooltips();
  }

  updatePagination(): void {
    this.currentPage = 1;
    this.calculateTotalPages();
    this.initializeTooltips();
  }

}
