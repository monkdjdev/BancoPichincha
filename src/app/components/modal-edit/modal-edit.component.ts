import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { CoreService } from 'src/app/core/core.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-modal-edit',
  templateUrl: './modal-edit.component.html',
  styleUrls: ['./modal-edit.component.scss']
})
export class ModalEditComponent implements OnInit{
  productForm: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _dataService: DataService,
    private _dialogRef: MatDialogRef<ModalEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _coreService: CoreService,
    private _datePipe: DatePipe

  ) {
    this.productForm = this._fb.group({
      id: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)], [this.idExistValidator.bind(this)]],
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: ['', Validators.required],
      date_release: ['', [Validators.required, this.dateReleaseValidator.bind(this)]],
      date_revision: [{ value: '', disabled: true }, [Validators.required, this.dateRevisionValidator.bind(this)]]
    });
  }

  dateReleaseValidator(control: AbstractControl): ValidationErrors | null {
    const selectedDate = new Date(control.value);
    const currentDate = new Date();

    if (selectedDate < currentDate) {
      return { invalidDate: true, dateBeforeToday: true };
    }

    return null;
  }

  dateRevisionValidator(control: AbstractControl): ValidationErrors | null {
    const selectedDate = new Date(control.value);
    const releaseDate = this.productForm.get('date_release')?.value;

    if (!releaseDate) {
      return { releaseDateRequired: true };
    }

    const oneYearAfterRelease = new Date(releaseDate);
    oneYearAfterRelease.setFullYear(oneYearAfterRelease.getFullYear() + 1);

    if (isNaN(selectedDate.getTime())) {
      return { invalidDate: true };
    }

    if (selectedDate.getTime() !== oneYearAfterRelease.getTime()) {
      return { invalidRevisionDate: true };
    }

    return null;
  }

  idExistValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    const id = control.value;

    if (!id) {
      return of(null);
    }

    return this._dataService.checkIdExist(id).pipe(
      switchMap((exists: boolean) => {
        return exists ? of({ idExists: true }) : of(null);
      }),
      catchError(() => of(null))
    );
  }

  ngOnInit(): void {
    this.productForm.patchValue(this.data);
    const idControl = this.productForm.get('id');


    const dateReleaseControl = this.productForm.get('date_release');
    if (dateReleaseControl) {
      dateReleaseControl.valueChanges.subscribe(value => {
        if (value) {
          const oneYearLater = new Date(value);
          oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);


          const dateRevisionControl = this.productForm.get('date_revision');
          if (dateRevisionControl) {
            dateRevisionControl.enable();
            dateRevisionControl.setValue(this._datePipe.transform(oneYearLater, 'yyyy-MM-dd'));
          }
        }
      });
    }

    if (this.data) {
      idControl?.disable();
    }
  }

  onReset() {
    this.productForm.reset();
  }

  onFormSubmit() {
    if (this.productForm.valid) {
      if (this.data) {
        this._dataService
          .updateEmployee(this.data.id, this.productForm.value)
          .subscribe({
            next: (val: any) => {
              this._coreService.openSnackBar('Employee detail updated!');
              this._dialogRef.close(true);
            },
            error: (err: any) => {
              console.error(err);
            },
          });
      } else {
        this._dataService.addEmployee(this.productForm.value).subscribe({
          next: (val: any) => {
            this._coreService.openSnackBar('Employee added successfully');
            this._dialogRef.close(true);
          },
          error: (err: any) => {
            console.error(err);
          },
        });
      }
    }
  }
}
