import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private url = 'assets/student-data.json';
  private isRecordUpdated$ = new Subject<unknown>();

  constructor(private httpClient: HttpClient) {}

  getStudentRecords() {
    return this.httpClient.get(this.url);
  }

  deleteStudent(id: any) {
    let studentRecord: any = sessionStorage.getItem('studentRecords');
    var studentData = JSON.parse(studentRecord);
    const indexToDelete = studentData.findIndex((item: any) => item.id === id);
    if (indexToDelete !== -1) {
      studentData.splice(indexToDelete, 1);
    }
    sessionStorage.setItem('studentRecords', JSON.stringify(studentData));
    this.setRecordUpdateState(true);
  }

  // To trigger student list referesh
  setRecordUpdateState(formData: unknown) {
    this.isRecordUpdated$.next(formData);
  }

  /* To update the list when there is any 
     update in student record
  */
  getRecordUpdateState(): Observable<unknown> {
    return this.isRecordUpdated$.asObservable();
  }
}
