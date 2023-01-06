import { ReceiptComponent } from './receipt/receipt.component';
import { ParkUnparkDialogComponent } from './park-unpark-dialog/park-unpark-dialog.component';
import { PARKING_SPACE } from './parking_space_mock';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private dialog: MatDialog) {}
  parking_space: any = PARKING_SPACE;

  form = new FormGroup({
    entrypoint: new FormControl('', [Validators.required]),
    platenumber: new FormControl('', [Validators.required]),
  });
  ngOnInit() {
    this.parking_space = JSON.parse(
      JSON.stringify(localStorage.getItem('parking_space'))
    );
    // this.parking_space = PARKING_SPACE;

    if (!this.parking_space) {
      this.parking_space = PARKING_SPACE;
      localStorage.setItem('parking_space', JSON.stringify(this.parking_space));
    }
    if (typeof this.parking_space === 'string')
      this.parking_space = JSON.parse(this.parking_space);

    this.checkParkingAvailable();
  }

  _parkUnpark(action: string) {
    this.dialog
      .open(ParkUnparkDialogComponent, {
        data: {
          action: action,
        },
        // disableClose: true,
        // height: '50%',
        // width: '50%',
      })
      .afterClosed()
      .subscribe((res: any) => {
        if (action === 'park') {
          this.parkVehicle(res);
        } else this.unParkVehicle(res);
      });
  }

  parkVehicle(data: any) {
    this.findNearestToEntry(data);
  }

  findNearestToEntry(data: any) {
    let createVehicleLogic =
      data.vehicleType === 'SM'
        ? ['SM', 'MP', 'LP']
        : data.vehicleType === 'MP'
        ? ['MP', 'LP']
        : ['LP'];

    //finding nearest slot by from own section

    let ownSection = this.parking_space.find(
      (sec: any) => sec.section === data.entrypoint
    );
    let foundSlot: any;

    foundSlot = ownSection.parking_area.findLast((slot: any) => {
      if (foundSlot) return;
      if (
        createVehicleLogic.includes(slot.type) &&
        slot.status === 'unoccupied'
      )
        return slot;
    });

    //if slot not found on own section find slot in the nearest section

    if (!foundSlot) {
      let sectionIndex = this.parking_space.findIndex(
        (sec: any) => sec.section === data.entrypoint
      );

      if (sectionIndex === 0) {
        let nearestSectionIndex = sectionIndex + 1;
        let section = this.parking_space[nearestSectionIndex];
        foundSlot = section.parking_area.findLast((slot: any) => {
          if (foundSlot) return;
          if (
            createVehicleLogic.includes(slot.type) &&
            slot.status === 'unoccupied'
          ) {
            return slot;
          }
        });
        if (!foundSlot) {
          let section = this.parking_space[nearestSectionIndex + 1];
          foundSlot = section.parking_area.findLast((slot: any) => {
            if (foundSlot) return;
            if (
              createVehicleLogic.includes(slot.type) &&
              slot.status === 'unoccupied'
            ) {
              return slot;
            }
          });
        }
      }
      if (sectionIndex === 2) {
        let nearestSectionIndex = sectionIndex - 1;
        let section = this.parking_space[nearestSectionIndex];
        foundSlot = section.parking_area.findLast((slot: any) => {
          if (foundSlot) return;
          if (
            createVehicleLogic.includes(slot.type) &&
            slot.status === 'unoccupied'
          ) {
            return slot;
          }
        });
        if (!foundSlot) {
          let section = this.parking_space[nearestSectionIndex - 1];
          foundSlot = section.parking_area.findLast((slot: any) => {
            if (foundSlot) return;
            if (
              createVehicleLogic.includes(slot.type) &&
              slot.status === 'unoccupied'
            ) {
              return slot;
            }
          });
        }
      }
      if (sectionIndex === 1) {
        let parkingA = this.parking_space[0];
        let parkingB = this.parking_space[2];
        let parkingAreaLength =
          parkingA.parking_area.length + parkingB.parking_area.length;
        for (let index = parkingAreaLength; index > 0; index--) {
          let slotA;

          slotA = parkingA.parking_area[index / 2 - 1];

          if (
            slotA &&
            createVehicleLogic.includes(slotA.type) &&
            slotA.status === 'unoccupied'
          ) {
            console.log(slotA);
            foundSlot = slotA;
          }

          if (foundSlot) break;
          else {
            let slotB;
            slotB = parkingB.parking_area[index / 2 - 1];
            if (
              slotB &&
              createVehicleLogic.includes(slotB.type) &&
              slotB.status === 'unoccupied'
            ) {
              foundSlot = slotB;
            }
          }

          if (foundSlot) break;
        }
      }
    }
    if (foundSlot) {
      foundSlot.status = 'occupied';
      foundSlot.plate_number = data.platenumber;
      foundSlot['parkingStart'] = new Date();
      // console.log(this.parking_space, 'FOUND');
      localStorage.setItem('parking_space', JSON.stringify(this.parking_space));
    } else {
      alert('NO PARKING AVAILABLE');
    }
    this.checkParkingAvailable();

    // localStorage.setItem('parking_space', JSON.stringify(this.parking_space));
  }
  unParkVehicle(data: any) {
    // console.log(data);

    let rate = 30;
    let charged: any = {};
    this.parking_space.forEach((section: any) => {
      section.parking_area.forEach((slot: any) => {
        // console.log(slot);
        if (
          slot &&
          slot.plate_number &&
          slot.plate_number.toLowerCase() === data.platenumber.toLowerCase()
        ) {
          slot.status = 'unoccupied';
          delete slot.plate_number;

          charged = this.computeParkingHours(slot);
          this.dialog.open(ReceiptComponent);

          localStorage.setItem(
            'parking_space',
            JSON.stringify(this.parking_space)
          );
        }
      });
    });

    this.checkParkingAvailable();
    // console.log(this.parking_space);
  }
  availableSlot = 0;

  computeParkingHours(parkingDetails: any) {
    let startDate = new Date(parkingDetails.parkStart);
    let endDate = new Date('Jan 6,2023 14:00:00');
    let excessHours = Math.round(
      (endDate.getTime() - startDate.getTime()) / 1000 / 3600
    );
    console.log(excessHours);
    let multiplier = excessHours > 3 ? excessHours - 3 : 1;
    let rate =
      excessHours > 3
        ? parkingDetails.rate + parkingDetails.rate * multiplier
        : parkingDetails.rate * multiplier;
    console.log(rate);

    return {
      plate_number: parkingDetails.plate_number,
      price: '',
      parkingStart: startDate,
      parkingEnd: endDate,
      excessHours,
    };
  }
  checkParkingAvailable() {
    this.availableSlot = 0;
    this.parking_space.forEach((sec: any) => {
      this.availableSlot += sec.parking_area.filter(
        (slot: any) => slot.status === 'unoccupied'
      ).length;
    });
  }
}
