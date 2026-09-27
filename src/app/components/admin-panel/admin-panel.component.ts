import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { OrderConfigComponent } from '../order-config/order-config.component';
import { OrderSummaryComponent } from '../order-summary/order-summary.component';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, MatTabsModule, OrderSummaryComponent, OrderConfigComponent],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent {
  /** 0 = Zamówienia, 1 = Konfiguracja */
  selectedIndex = 0;

  onTabChange(index: number) {
    this.selectedIndex = index;
  }
}
