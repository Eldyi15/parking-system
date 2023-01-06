import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-park-unpark-dialog',
  templateUrl: './park-unpark-dialog.component.html',
  styleUrls: ['./park-unpark-dialog.component.scss'],
})
export class ParkUnparkDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public diagRef: MatDialogRef<ParkUnparkDialogComponent>
  ) {}
  form = new FormGroup({
    entrypoint: new FormControl(''),
    platenumber: new FormControl('', [Validators.required]),
    vehicleType: new FormControl(''),
  });

  ngOnInit(): void {
    if (this.data.action === 'park') {
      this.form.controls['entrypoint'].setValidators(Validators.required);
      this.form.controls['entrypoint'].updateValueAndValidity();
    }
  }
  close() {
    this.diagRef.close(this.form.getRawValue());
  }
}
