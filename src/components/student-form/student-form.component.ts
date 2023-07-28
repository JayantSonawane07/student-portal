import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { map, startWith } from 'rxjs';
@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.scss'],
})
export class StudentFormComponent implements OnInit {
  registrationForm!: FormGroup;
  id: string | null;
  hobbies: any = [
    { name: 'Photography', isChecked: false },
    { name: 'Dance', isChecked: false },
    { name: 'Singing', isChecked: false },
    { name: 'Cooking', isChecked: false },
  ];
  selected: any;
  states: string[] = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Maharashtra',
    'Goa',
    'Karnataka',
  ];
  countries: string[] = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'India',
    'China',
  ];
  filteredStates!: string[];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastrService: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
    this.filteredStates = this.states.slice();
    this.registrationForm.controls['state'].valueChanges
      .pipe(
        startWith(''),
        map((value) => this.filterStates(value))
      )
      .subscribe((filtered) => {
        this.filteredStates = filtered;
      });

    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.id) {
      this.fetchStudentData(this.id);
    }
  }

  filterStates(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.states.filter((state) =>
      state.toLowerCase().includes(filterValue)
    );
  }

  initForm() {
    this.registrationForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      hobbies: this.formBuilder.array([]),
      specilizations: new FormArray([]),
    });
  }

  specilizations(): FormArray {
    return this.registrationForm.get('specilizations') as FormArray;
  }

  newSpecilizations(): FormGroup {
    return this.formBuilder.group({
      specilizationTitle: '',
      details: new FormArray([]),
    });
  }

  addSpecilization() {
    this.specilizations().push(this.newSpecilizations());
    this.cdr.markForCheck();
  }

  removeSpecilization(specilizationIndex: number) {
    this.specilizations().removeAt(specilizationIndex);
  }

  specilizationDetails(specilizationIndex: number): FormArray {
    return this.specilizations()
      .at(specilizationIndex)
      .get('details') as FormArray;
  }

  newTopic(): FormGroup {
    return this.formBuilder.group({
      topic: '',
      grades: '',
    });
  }

  addSpecilizationTopic(specilizationIndex: number) {
    this.specilizationDetails(specilizationIndex).push(this.newTopic());
  }

  removeSpecilizationTopic(specilizationIndex: number, topicIndex: number) {
    this.specilizationDetails(specilizationIndex).removeAt(topicIndex);
  }

  fetchStudentData(id: string) {
    let studentRecord: any = sessionStorage.getItem('studentRecords');
    var studentData = JSON.parse(studentRecord);
    let selectedStudentRecord = studentData.find((item: any) => item.id === id);
    this.patchFormValue(selectedStudentRecord);
  }

  patchFormValue(studentRecord: any) {
    this.registrationForm?.patchValue({
      firstName: studentRecord?.firstName,
      lastName: studentRecord?.lastName,
      email: studentRecord?.email,
      phone: studentRecord?.phone,
      address: studentRecord?.address,
      city: studentRecord?.city,
      state: studentRecord?.state,
      country: studentRecord?.country,
      dob: new Date(studentRecord?.dob),
      gender: studentRecord?.gender,
      hobbies: this.patchHobbies(studentRecord?.hobbies),
    });
    studentRecord?.specilizations?.forEach((record: any) => {
      (<FormArray>this.registrationForm?.get('specilizations'))?.push(
        this.getNewFormGroup(record)
      );
    });
  }

  patchHobbies(hobbies: any): any {
    this.hobbies?.forEach((hobby: any) => {
      if (hobbies.includes(hobby.name)) {
        hobby.isChecked = true;
      } else {
        hobby.isChecked = false;
      }
    });
  }

  getNewFormGroup(specilizations: any) {
    return this.formBuilder?.group({
      specilizationTitle: specilizations?.specilizationTitle,
      details: new FormArray([
        this.formBuilder?.group({
          topic: specilizations?.details[0]?.topic,
          grades: specilizations?.details[0]?.grades,
        }),
      ]),
    });
  }

  ngOnInit(): void {}

  saveStudentRecord() {
    if (this.registrationForm?.valid) {
      let formData = this.registrationForm?.value;
      let studentRecord: any = sessionStorage.getItem('studentRecords');
      let newIndex: any = JSON.stringify(
        Number(sessionStorage.getItem('lastIndex')) + 1
      );
      var studentData = JSON.parse(studentRecord);
      formData.id = newIndex;

      if (this.id) {
        const indexToDelete = studentData.findIndex(
          (item: any) => item.id === this.id
        );
        if (indexToDelete !== -1) {
          studentData.splice(indexToDelete, 1);
        }
        this.toastrService.success('Record Updated Successfully!');
      } else {
        this.toastrService.success('Record Saved Successfully!');
      }
      let newStudentData = [...studentData, formData];
      sessionStorage.setItem('studentRecords', JSON.stringify(newStudentData));
      sessionStorage.setItem('lastIndex', newIndex);

      this.navigateToListScreen();
    } else {
      this.toastrService.error('Please fill all the required fields');
    }
  }

  onHobbiesSelectionChange(event: any) {
    const hobbies = (<FormArray>(
      this.registrationForm.get('hobbies')
    )) as FormArray;

    if (event.checked) {
      hobbies.push(new FormControl(event.source.value));
    } else {
      const i = hobbies.controls.findIndex(
        (x) => x.value === event.source.value
      );
      hobbies.removeAt(i);
    }
  }

  navigateToListScreen() {
    this.router.navigate(['list']);
  }
}
