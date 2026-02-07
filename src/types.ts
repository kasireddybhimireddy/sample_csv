export interface ExchangeRateData {
  date: string;
  rate: number;
}

export interface ProcessedData {
  data: ExchangeRateData[];
  fileName: string;
  totalRows: number;
  validRows: number;
}
