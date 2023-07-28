import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DialogData } from './delete-dialog.model';
import { StudentService } from 'src/service/student.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss'],
})
export class DeleteDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private service: StudentService,
    public dialog: MatDialog,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {}

  closeDialog() {
    this.dialog.closeAll();
  }

  deleteRecord() {
    this.service.deleteStudent(this.data?.id);
    this.toastrService.success('Record deleted successfully!');
    this.dialog.closeAll();
  }
}
