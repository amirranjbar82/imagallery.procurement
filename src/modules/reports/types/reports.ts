export interface Report {
  reportId: string;
  type: ReportType;
  title: string;
  description?: string;
  moduleType: ModuleType;
  referenceId?: string;
  data: ReportData;
  parameters: ReportParameters;
  schedule?: ReportSchedule;
  recipients?: string[];
  generatedBy: string;
  generatedAt: Date;
  status: ReportStatus;
  error?: string;
  exportUrls: ExportUrls;
  tags: string[];
  isTemplate: boolean;
  templateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportData {
  summary: ReportSummary;
  details: any[];
  charts: ChartData[];
  metadata: ReportMetadata;
}

export interface ReportSummary {
  totalRecords: number;
  dateRange: DateRange;
  aggregations: { [key: string]: number };
  trends: TrendData[];
  kpis: KPIData[];
}

export interface ChartData {
  id: string;
  type: ChartType;
  title: string;
  data: any[];
  config: ChartConfig;
}

export interface ReportMetadata {
  generationTime: number;
  dataSourceVersion: string;
  filtersApplied: Filter[];
  calculationMethods: { [key: string]: string };
}

export interface ReportParameters {
  dateRange: DateRange;
  filters: Filter[];
  groupBy: string[];
  sortBy: SortOption[];
  includeCharts: boolean;
  includeDetails: boolean;
  format: ReportFormat;
  customFields?: string[];
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
  period?: TimePeriod;
}

export interface Filter {
  field: string;
  operator: FilterOperator;
  value: any;
  label?: string;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ReportSchedule {
  scheduleId: string;
  frequency: ScheduleFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
  isActive: boolean;
  lastRun?: Date;
  nextRun: Date;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  recipients: string[];
  subject?: string;
  message?: string;
}

export interface ExportUrls {
  pdf?: string;
  excel?: string;
  csv?: string;
  json?: string;
}

export interface TrendData {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface KPIData {
  id: string;
  name: string;
  value: number;
  target?: number;
  unit: string;
  format: 'number' | 'currency' | 'percentage';
  status: 'good' | 'warning' | 'critical';
}

export interface ChartConfig {
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  colors?: string[];
  legend?: LegendConfig;
  tooltip?: TooltipConfig;
}

export interface AxisConfig {
  label?: string;
  format?: string;
  min?: number;
  max?: number;
}

export interface LegendConfig {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface TooltipConfig {
  show: boolean;
  format?: string;
}

export interface ReportTemplate {
  templateId: string;
  name: string;
  description?: string;
  type: ReportType;
  moduleType: ModuleType;
  defaultParameters: ReportParameters;
  layout: ReportLayout;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportLayout {
  sections: ReportSection[];
  styling: ReportStyling;
}

export interface ReportSection {
  id: string;
  type: SectionType;
  title?: string;
  content: any;
  order: number;
  visible: boolean;
}

export interface ReportStyling {
  theme: 'light' | 'dark';
  primaryColor: string;
  font: string;
  fontSize: number;
  spacing: 'compact' | 'normal' | 'spacious';
}

export type ReportType = 'soa' | 'spend-analysis' | 'supplier-performance' | 'inventory' | 'sales' | 'tasks' | 'financial' | 'custom';
export type ModuleType = 'procurement' | 'sales' | 'inventory' | 'tasks' | 'organization' | 'documents' | 'cross-module';
export type ReportStatus = 'generating' | 'completed' | 'failed' | 'scheduled';
export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'html';
export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type FilterOperator = 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'greater-than' | 'less-than' | 'in' | 'not-in' | 'between';
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'radar' | 'table';
export type SectionType = 'summary' | 'chart' | 'table' | 'text' | 'image' | 'custom';
