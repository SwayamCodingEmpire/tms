import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-file-upload-modal',
  standalone: false,
  templateUrl: './file-upload-modal.component.html',
  styleUrl: './file-upload-modal.component.scss'
})
export class FileUploadModalComponent {
  @Output() closeEvent = new EventEmitter<void>();
  @Output() uploadCompleteEvent = new EventEmitter<any>();

  selectedFile: File | null = null;

  constructor() {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files.length) {
      this.handleFileSelection(event.dataTransfer.files[0]);
    }
  }

  onFileChange(event: any): void {
    if (event.target.files.length) {
      this.handleFileSelection(event.target.files[0]);
    }
  }

  handleFileSelection(file: File): void {
    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds the 2MB limit.');
      return;
    }

    // Check file type
    const validTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'audio/*',
      'video/*'
    ];

    const fileType = file.type;
    if (!validTypes.some(type =>
      type === fileType ||
      (type.endsWith('/*') && fileType.startsWith(type.slice(0, -2)))
    )) {
      alert('Invalid file type. Please upload a PDF, Excel, PowerPoint, audio, or video file.');
      return;
    }

    this.selectedFile = file;
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    // In a real application, you would send the file to the server here
    // For demonstration, we'll simulate a successful upload

    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    // Simulate successful upload
    setTimeout(() => {
      const uploadedFile = {
        name: this.selectedFile?.name,
        size: this.selectedFile?.size,
        type: this.selectedFile?.type,
        url: URL.createObjectURL(this.selectedFile as Blob)
      };

      this.uploadCompleteEvent.emit(uploadedFile);
      this.closeModal();
    }, 1000);
  }

  closeModal(): void {
    this.closeEvent.emit();
  }

}
