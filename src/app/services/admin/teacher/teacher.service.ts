import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private baseUrl ='http://localhost:3000/teachers'; // Replace with your API endpoint

  constructor(private http : HttpClient) { }
  
     getTeacher(): Observable<any[]> {
      return this.http.get<any[]>(this.baseUrl);
    }
  
    addTeacher(course: any): Observable<any> {
      return this.http.post(this.baseUrl, course);
    }
  
    updateTeacher(id: number, course: any): Observable<any> {
      return this.http.put(`${this.baseUrl}/${id}`, course);
    }
  
    deleteTeacher(id: number): Observable<any> {
      return this.http.delete(`${this.baseUrl}/${id}`);
    }
  }
  

