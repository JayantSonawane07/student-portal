import { Component, OnInit } from '@angular/core';
import { StudentTable } from './student-list.model';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss'],
})
export class StudentListComponent implements OnInit {
  STUDENT_DATA: StudentTable[] = [
    {
      name: 'John Dove',
      email: 'johndove@mail.com',
      address: 'Pune',
      topics: 'Topic 1, Topic 2',
    },
    {
      name: 'John Dove',
      email: 'johndove@mail.com',
      address: 'Pune',
      topics: 'Topic 1, Topic 2',
    },
    {
      name: 'John Dove',
      email: 'johndove@mail.com',
      address: 'Pune',
      topics: 'Topic 1, Topic 2',
    },
  ];
  displayedColumns: string[] = [
    'name',
    'email',
    'address',
    'topics',
    'actions',
  ];
  dataSource = this.STUDENT_DATA;

  constructor() {}

  ngOnInit(): void {}

  exportTable() {}
}
