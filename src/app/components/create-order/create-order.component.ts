import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { Bread } from '../../models/bread';
import { Order } from '../../models/order';
import { BreadService } from '../../services/bread.service';
import { Notice, OrderDate } from '../../models/order-config';
import { OrderConfigService } from '../../services/order-config.service';
import { OrderService } from '../../services/order.service';
import { OrderFormComponent } from '../order-form/order-form.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [OrderFormComponent ,CommonModule, FormsModule, ReactiveFormsModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCardModule, MatIconModule, MatDividerModule],
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.css'
})
export class CreateOrderComponent implements OnInit {
  
  order: Order = {
    customerName: '',
    phone: undefined,
    orderDate: undefined,
    items: []
  };

  @ViewChild(OrderFormComponent) orderForm!: OrderFormComponent; 
  
  breadTypes: Bread[] = [];  
  availableDates: OrderDate[] = [];
  notice: Notice | null = null;
  showValidationErrors = true;
  isSubmitting = false;
  orderSubmitted = false;
  submissionSuccess = false;

  private orderService = inject(OrderService);
  private breadService = inject(BreadService);
  private orderConfigService = inject(OrderConfigService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  ngOnInit() {
    this.loadBreads();
    this.loadConfig();
  }

  loadConfig() {
    this.orderConfigService.getPublicConfig().subscribe({
      next: (config) => {
        this.notice = config.notice;
        this.availableDates = config.dates;
        this.order.orderDate = this.availableDates[0]?.date;
      },
      error: () => alert('❌ Nie udało się pobrać dostępnych terminów!')
    });
  }

  redirectIfNotMonday() {
    const today = new Date();
    if (today.getDay() !== 1) {
      this.router.navigate(['/summary']);
    }
  }
  reloadView() {
    window.location.reload();
  }

  resetForm() {
    this.orderSubmitted = false;
    this.submissionSuccess = false;
    this.orderForm.resetForm();
  }

  loadBreads() {
    this.breadService.getBreads().subscribe({
      next: (data) => {
        this.breadTypes = data;
      },
      error: () => alert('❌ Nie udało się pobrać listy chlebów!')
    });
  }

  isFormValid() {
    return this.orderForm?.isFormValid();
  }

  submitOrder() {
    this.isSubmitting = true; 
  
    this.orderService.submitOrder(this.order).subscribe({
      next: () => {
        this.submissionSuccess = true;
        this.orderSubmitted = true;
        this.isSubmitting = false;  
      },
      error: () => {
        this.submissionSuccess = false;
        this.orderSubmitted = true;
        this.isSubmitting = false; 
      }
    });
  }

 
  openConfirmationDialog() {
    if (!this.isFormValid()) {
      this.showValidationErrors = true;
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '500px',
      data: { order: this.order, breads: this.breadTypes }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.submitOrder();
      }
    });
  }

}
