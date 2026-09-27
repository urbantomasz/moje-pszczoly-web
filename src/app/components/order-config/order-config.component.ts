import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormatDatePipe } from '../../pipes/format-date.pipe';
import { UpdateOrderConfigRequest } from '../../models/order-config';
import { OrderConfigService } from '../../services/order-config.service';

interface EditableDate {
  date: Date;
  note: string;
}

@Component({
  selector: 'app-order-config',
  standalone: true,
  imports: [
    FormsModule, MatSlideToggleModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatButtonModule, MatProgressSpinnerModule, FormatDatePipe
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pl-PL' }
  ],
  templateUrl: './order-config.component.html',
  styleUrl: './order-config.component.css'
})
export class OrderConfigComponent implements OnInit {
  readonly maxTitleLength = 120;
  readonly maxMessageLength = 500;
  readonly maxNoteLength = 200;

  useCustomDates = false;
  noticeEnabled = false;
  noticeTitle = '';
  noticeMessage = '';

  dates: EditableDate[] = [];
  generatedDates: Date[] = [];

  dateToAdd: Date | null = null;
  loading = true;
  saving = false;

  private orderConfigService = inject(OrderConfigService);
  private snackBar = inject(MatSnackBar);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.orderConfigService.getAdminConfig().subscribe({
      next: (config) => {
        this.useCustomDates = config.useCustomDates;
        this.noticeEnabled = config.noticeEnabled;
        this.noticeTitle = config.noticeTitle ?? '';
        this.noticeMessage = config.noticeMessage ?? '';
        this.dates = config.customDates.map(d => ({ date: d.date, note: d.note ?? '' }));
        this.generatedDates = config.generatedDates;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notify('❌ Nie udało się wczytać konfiguracji!');
      }
    });
  }

  addDate() {
    if (!this.dateToAdd) return;

    const date = this.toUtcMidnight(this.dateToAdd);
    if (this.dates.some(d => d.date.getTime() === date.getTime())) {
      this.notify('Ta data jest już na liście.');
      this.dateToAdd = null;
      return;
    }

    this.dates = [...this.dates, { date, note: '' }].sort((a, b) => a.date.getTime() - b.date.getTime());
    this.dateToAdd = null;
  }

  removeDate(index: number) {
    this.dates = this.dates.filter((_, i) => i !== index);
  }

  save() {
    if (this.useCustomDates && this.dates.length === 0) {
      this.notify('Włączone własne daty wymagają co najmniej jednej daty.');
      return;
    }
    if (this.noticeEnabled && this.noticeMessage.trim().length === 0) {
      this.notify('Włączony komunikat wymaga treści.');
      return;
    }

    const payload: UpdateOrderConfigRequest = {
      useCustomDates: this.useCustomDates,
      noticeEnabled: this.noticeEnabled,
      noticeTitle: this.noticeTitle.trim() || null,
      noticeMessage: this.noticeMessage.trim() || null,
      customDates: this.dates.map(d => ({
        date: d.date.toISOString(),
        note: d.note.trim() || null
      }))
    };

    this.saving = true;
    this.orderConfigService.updateConfig(payload).subscribe({
      next: () => {
        this.saving = false;
        this.notify('✅ Konfiguracja zapisana!');
      },
      error: (err) => {
        this.saving = false;
        this.notify(`❌ ${err?.error?.message ?? 'Nie udało się zapisać konfiguracji!'}`);
      }
    });
  }

  /** Daty dostaw trzymamy jako północ UTC, więc odcinamy strefę wybraną w kalendarzu. */
  private toUtcMidnight(localDate: Date): Date {
    return new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 0, 0, 0));
  }

  private notify(message: string) {
    this.snackBar.open(message, 'Zamknij', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
