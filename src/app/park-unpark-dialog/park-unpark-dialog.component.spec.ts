import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkUnparkDialogComponent } from './park-unpark-dialog.component';

describe('ParkUnparkDialogComponent', () => {
  let component: ParkUnparkDialogComponent;
  let fixture: ComponentFixture<ParkUnparkDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParkUnparkDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParkUnparkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
