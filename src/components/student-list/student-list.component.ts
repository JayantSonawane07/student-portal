import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { StudentTable } from './student-list.model';
import { Router } from '@angular/router';
import { StudentService } from 'src/service/student.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss'],
})
export class StudentListComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('TABLE') table!: ElementRef;

  displayedColumns: string[] = [
    'name',
    'email',
    'address',
    'topics',
    'actions',
  ];
  dataSource!: MatTableDataSource<StudentTable>;
  isDataReady: boolean = false;
  initialsBackgroundColors = ['red', 'yellow', 'green'];

  constructor(
    private router: Router,
    private service: StudentService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private toastrService: ToastrService
  ) {
    this.isDataReady = false;
    this.getTableData();

    this.service.getRecordUpdateState()?.subscribe((event: any) => {
      this.prepareTableData();
    });
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.sort = this.sort;
    }
  }

  getTableData() {
    if (!sessionStorage.getItem('studentRecords')) {
      this.service.getStudentRecords().subscribe((response: any) => {
        sessionStorage.setItem('studentRecords', JSON.stringify(response));
        sessionStorage.setItem('lastIndex', response.length);
        this.prepareTableData();
      });
    } else {
      this.prepareTableData();
    }
  }

  prepareTableData() {
    let studentRecord: any = sessionStorage.getItem('studentRecords');
    var studentData = JSON.parse(studentRecord);

    if (studentData && Array.isArray(studentData)) {
      let data = studentData.map((data: any) => {
        const nameDetails = {
          initial:
            data.firstName[0].toUpperCase() + data.lastName[0].toUpperCase(),
          name: `${data.firstName} ${data.lastName}`,
          phone: data.phone,
          specilizations: this.getSpecilizations(data.specilizations),
        };
        const address = [
          data.address,
          data.city,
          data.state,
          data.country,
        ].join(', ');

        const topics = this.getTopics(data);

        return {
          id: data.id,
          name: nameDetails,
          email: data.email,
          address,
          topics,
        };
      });
      this.dataSource = new MatTableDataSource<any>(data);
      this.isDataReady = true;
    }
  }

  getSpecilizations(specilizations: any): any {
    let spec: any = [];

    specilizations?.forEach((specilization: any) => {
      spec.push(specilization.specilizationTitle);
    });

    return spec;
  }

  getTopics(dataArray: any) {
    let allTopics: any = [];

    dataArray.specilizations?.forEach((spec: any) => {
      spec.details?.forEach((detail: any, index: any) => {
        allTopics.push(detail.topic);
      });
    });

    return allTopics;
  }

  ngOnInit(): void {}

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.cdr.markForCheck();
  }

  addNewStudent() {
    this.router.navigate(['form']);
  }

  editRecord(rowData: any) {
    this.router.navigate(['form', rowData?.id]);
  }

  deleteRecord(rowData: any) {
    this.dialog.open(DeleteDialogComponent, {
      data: rowData,
    });
  }

  exportToExcel() {
    const selectedData = this.dataSource?.filteredData.map((item) => ({
      Name: item.name,
      Email: item.email,
      Address: item.address,
      Topics: item.topics,
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(selectedData);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const fileName: string = 'Student Data.xlsx';

    this.saveAsExcelFile(data, fileName);
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url: string = window.URL.createObjectURL(data);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    this.toastrService.success('Excel exported successfully!');
  }
}
