import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-batches',
  standalone: false,
  templateUrl: './batches.component.html',
  styleUrl: './batches.component.scss'
})
export class BatchesComponent {

  rootForm!: FormGroup;
  studentsList = ['Mohit Singh','Neha Mohan','Alice','Bob','Charlie'];
  coursesList  = ['PHP Basics','Data Visualisation','Angular','React'];
  teachersList = ['Tushita Shekhar','Neha Samal','Ranjana Singh','Saurabh Sinha'];


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
    this.initialBatches.forEach(b => this.loadBatch(b));
  }

  /** FormArray getters **/
  get batches() { return this.rootForm.get('batches') as FormArray; }
  programs(bi: number) { return (this.batches.at(bi) as FormGroup).get('programs') as FormArray; }
  courses(bi: number, pi: number) { return this.programs(bi).at(pi).get('courses') as FormArray; }

  /** Create factories **/
  private createBatchGroup() {
    return new FormGroup({
      batchCode:      new FormControl(''),
      batchName:      new FormControl(''),
      batchStartDate: new FormControl(''),
      editing:        new FormControl(true),
      programs:       new FormArray([])
    });
  }
  private createProgramGroup() {
    return new FormGroup({
      programCode: new FormControl(''),
      programName: new FormControl(''),
      students:    new FormArray([]),
      editing:     new FormControl(true),
      courses:     new FormArray([])
    });
  }
  private createCourseGroup() {
    return new FormGroup({
      courseCode: new FormControl(''),
      courseName: new FormControl(''),
      teacher:    new FormControl(''),
      editing:    new FormControl(true)
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
      pg.patchValue({ programCode: p.programCode, programName: p.programName });
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
  }

  /** Batch actions **/
  addBatch()    { this.batches.push(this.createBatchGroup()); }
  saveBatch(i: number)  { this.batches.at(i).get('editing')!.setValue(false); }
  editBatch(i: number)  { this.batches.at(i).get('editing')!.setValue(true); }
  removeBatch(i: number){ this.batches.removeAt(i); }

  /** Program actions **/
  addProgram(bi: number)               { this.programs(bi).push(this.createProgramGroup()); }
  saveProgram(bi: number, pi: number) { this.programs(bi).at(pi).get('editing')!.setValue(false); }
  editProgram(bi: number, pi: number) { this.programs(bi).at(pi).get('editing')!.setValue(true); }
  removeProgram(bi: number, pi: number){ this.programs(bi).removeAt(pi); }
  onStudentSelect(ev: Event, bi: number, pi: number) {
    const fa = this.programs(bi).at(pi).get('students') as FormArray;
    fa.clear();
    Array.from((ev.target as any).selectedOptions)
      .map((o: any) => o.value)
      .forEach(v => fa.push(new FormControl(v)));
  }

  /** Course actions **/
  addCourse(bi: number, pi: number)                { this.courses(bi,pi).push(this.createCourseGroup()); }
  saveCourse(bi: number, pi: number, ci: number)   { this.courses(bi,pi).at(ci).get('editing')!.setValue(false); }
  editCourse(bi: number, pi: number, ci: number)   { this.courses(bi,pi).at(ci).get('editing')!.setValue(true); }
  removeCourse(bi: number, pi: number, ci: number) { this.courses(bi,pi).removeAt(ci); }

  /** Utility **/
  refresh() { this.ngOnInit(); }
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

