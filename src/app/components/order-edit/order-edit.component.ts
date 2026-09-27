import { Component, inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Order } from '../../models/order';
import { Bread } from '../../models/bread';
import { OrderDate } from '../../models/order-config';
import { OrderFormComponent } from '../order-form/order-form.component';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { OrderService } from '../../services/order.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-edit',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, OrderFormComponent],
  templateUrl: './order-edit.component.html',
  styleUrl: './order-edit.component.css'
})
export class OrderEditComponent  {
  @ViewChild(OrderFormComponent) orderForm!: OrderFormComponent;
  public dialogRef = inject(MatDialogRef<OrderEditComponent>);
  public data = inject(MAT_DIALOG_DATA) as { order: Order; breads: Bread[]; dates: Date[] };
  private orderService = inject(OrderService);
  private snackBar = inject(MatSnackBar);

  order: Order = this.data.order;
  breadTypes: Bread[] = this.data.breads;
  availableDates: OrderDate[] = this.data.dates.map(date => ({ date }));

  saveChanges() {
    if (!this.orderForm?.isFormValid()) return;

    this.orderService.updateOrder(this.order.orderId as number, this.order).subscribe({
      next: () => {
        this.snackBar.open('✅ Zamówienie zostało zmienione!', 'Zamknij', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
        this.dialogRef.close(this.order);
      },
      error: (err) => {
         this.snackBar.open('❌ Błąd podczas zapisu!', 'Zamknij', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
      console.error(err);
      },
    });
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
