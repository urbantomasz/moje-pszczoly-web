export interface OrderDate {
  date: Date;
  note?: string | null;
}

export interface Notice {
  title?: string | null;
  message?: string | null;
}

/** Konfiguracja widoczna dla klienta składającego zamówienie. */
export interface PublicOrderConfig {
  notice: Notice | null;
  dates: OrderDate[];
}

/** Pełny stan konfiguracji na potrzeby panelu administracyjnego. */
export interface AdminOrderConfig {
  useCustomDates: boolean;
  noticeEnabled: boolean;
  noticeTitle?: string | null;
  noticeMessage?: string | null;
  customDates: OrderDate[];
  /** Podgląd dat, które wyliczą się automatycznie po wyłączeniu własnych dat. */
  generatedDates: Date[];
  updatedAt: Date;
}

export interface UpdateOrderConfigRequest {
  useCustomDates: boolean;
  noticeEnabled: boolean;
  noticeTitle: string | null;
  noticeMessage: string | null;
  customDates: { date: string; note: string | null }[];
}
