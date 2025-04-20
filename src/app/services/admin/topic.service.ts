import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TopicService {
  private baseUrl = 'http://localhost:3000/topics';

  constructor(private http: HttpClient) { }

     getTopics(): Observable<any[]> {
      return this.http.get<any[]>(this.baseUrl);
    }

    addTopics(topic: any): Observable<any> {
      return this.http.post(this.baseUrl, topic);
    }

    updateTopics(id: number, topic: any): Observable<any> {
      return this.http.put(`${this.baseUrl}/${id}`, topic);
    }

    deleteTopic(id: number): Observable<any> {
      return this.http.delete(`${this.baseUrl}/${id}`);
    }
}
