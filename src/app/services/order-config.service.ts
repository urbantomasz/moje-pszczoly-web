import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AdminOrderConfig, PublicOrderConfig, UpdateOrderConfigRequest } from '../models/order-config';

@Injectable({
  providedIn: 'root'
})
export class OrderConfigService {
  private apiUrl = `${environment.apiUrl}/order-config`;
  private http = inject(HttpClient);

  getPublicConfig(): Observable<PublicOrderConfig> {
    return this.http.get<PublicOrderConfig>(`${this.apiUrl}`).pipe(
      map(response => ({
        notice: response.notice,
        dates: response.dates.map(d => ({ date: new Date(d.date), note: d.note }))
      }))
    );
  }

  getAdminConfig(): Observable<AdminOrderConfig> {
    return this.http.get<AdminOrderConfig>(`${this.apiUrl}/admin`).pipe(
      map(response => ({
        ...response,
        customDates: response.customDates.map(d => ({ date: new Date(d.date), note: d.note })),
        generatedDates: response.generatedDates.map(d => new Date(d)),
        updatedAt: new Date(response.updatedAt)
      }))
    );
  }

  updateConfig(payload: UpdateOrderConfigRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, payload);
  }
}
