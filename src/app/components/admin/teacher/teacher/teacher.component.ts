import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { TeacherService } from '../../../../services/admin/teacher/teacher.service';


@Component({
  selector: 'app-teacher',
  standalone: false,
  templateUrl: './teacher.component.html',
  styleUrl: './teacher.component.scss'
})
export class TeacherComponent {
  teacherForm: FormGroup;
  teacherList: any[] = [];
constructor(private route: ActivatedRoute, private teacherService: TeacherService) {
  this.teacherForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    course: new FormArray([]),
  })
}

//To add a new course to the form array
get course() {
  return this.teacherForm.get('course') as FormArray;
}
// on refresh data persists
  ngOnInit() {
    this.loadData();
  }
//Load the data from the service
  loadData(){
    this.teacherService.getTeacher().subscribe((data) => {
      this.teacherList = data;
    });
  }
//Add a new teacher
  addRow(){
    const newRow = {
      name: '',
      email: '',
      course: ''
    };
    this.teacherList.push(newRow);
  }

  //save the data to the service
  saveData() {
    const formData = this.teacherForm.value;
    this.teacherService.addTeacher(formData).subscribe((response) => {
      console.log('Teacher added successfully', response);
      this.loadData();
    }, (error) => {
      console.error('Error adding teacher', error);
    });
  }
}