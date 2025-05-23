import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseServicesService {
  private baseUrl ='http://localhost:3000/courses'; // Replace with your API endpoint

  constructor(private http:HttpClient) {

   }


   getCourses(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  addCourse(course: any): Observable<any> {
    return this.http.post(this.baseUrl, course);
  }

  updateCourse(id: number, course: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, course);
  }

  deleteCourse(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
