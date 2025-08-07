// API service for connecting to hercules-backend
const API_BASE_URL = 'http://localhost:5000/api';

export interface KPIData {
  "Batch GUID": string;
  "Batch Name": string;
  "Product Name": string;
  "Batch Act Start": string;
  "Batch Act End": string;
  "Quantity": number;
  "Material Name": string;
  "Material Code": string;
  "SetPoint Float": number;
  "Actual Value Float": number;
  "Source Server": string;
  "ROOTGUID": string;
  "OrderId": number;
  "Batch Transfer Time": string;
  "FormulaCategoryName": string;
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  batch?: string[];
  product?: string[];
  material?: string[];
  page?: number;
  limit?: number;
}

export interface ReportResponse {
  data: KPIData[];
  page: number;
  pages: number;
  total: number;
  reportType?: string;
}

// Calendar data interface
export interface CalendarData {
  date: string;
  total_actual_kg: number;
  total_actual_ton: number;
  batch_count: number;
  product_count: number;
}

// SMTP Profile interface
export interface SMTPProfile {
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  sender: string;
  use_tls?: boolean;
}

// Logo response interface
export interface LogoResponse {
  logoUrl: string;
  message?: string;
}

// API service functions
export const apiService = {
  // Fetch KPI data with filters
  async getKPIData(filters: ReportFilters): Promise<ReportResponse> {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.batch) filters.batch.forEach(b => params.append('batch', b));
    if (filters.product) filters.product.forEach(p => params.append('product', p));
    if (filters.material) filters.material.forEach(m => params.append('material', m));
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/kpi?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch KPI data: ${response.statusText}`);
    }
    return response.json();
  },

  // Fetch report data (daily, weekly, monthly)
  async getReportData(filters: ReportFilters, reportType: string = 'daily'): Promise<ReportResponse> {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.batch) filters.batch.forEach(b => params.append('batch', b));
    if (filters.product) filters.product.forEach(p => params.append('product', p));
    if (filters.material) filters.material.forEach(m => params.append('material', m));
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    params.append('reportType', reportType);

    const response = await fetch(`${API_BASE_URL}/reports?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch report data: ${response.statusText}`);
    }
    return response.json();
  },

  // Fetch CSV format report
  async getCSVFormatReport(filters: ReportFilters): Promise<ReportResponse> {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.batch) filters.batch.forEach(b => params.append('batch', b));
    if (filters.product) filters.product.forEach(p => params.append('product', p));
    if (filters.material) filters.material.forEach(m => params.append('material', m));
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/kpi/csv-format-report?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV format report: ${response.statusText}`);
    }
    return response.json();
  },

  // ===== ADMIN API FUNCTIONS =====

  // Upload logo
  async uploadLogo(file: File): Promise<LogoResponse> {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await fetch(`${API_BASE_URL}/logo`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload logo: ${response.statusText}`);
    }
    return response.json();
  },

  // Get logos
  async getLogos(page: number = 1, limit: number = 5): Promise<any> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/logo?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch logos: ${response.statusText}`);
    }
    return response.json();
  },

  // Save SMTP settings
  async saveSMTPSettings(settings: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/settings/smtp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`Failed to save SMTP settings: ${response.statusText}`);
    }
    return response.json();
  },

  // Get SMTP profiles
  async getSMTPProfiles(page: number = 1, limit: number = 10): Promise<any> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/settings/smtp-profiles?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch SMTP profiles: ${response.statusText}`);
    }
    return response.json();
  },

  // Add SMTP profile
  async addSMTPProfile(profile: SMTPProfile): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/settings/smtp-profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      throw new Error(`Failed to add SMTP profile: ${response.statusText}`);
    }
    return response.json();
  },

  // Activate SMTP profile
  async activateSMTPProfile(name: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/settings/smtp-profiles/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error(`Failed to activate SMTP profile: ${response.statusText}`);
    }
    return response.json();
  },

  // Send test email
  async sendTestEmail(recipient: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/settings/send-test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipient }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send test email: ${response.statusText}`);
    }
    return response.json();
  },

  // ===== BATCH CALENDAR API FUNCTIONS =====

  // Get calendar data
  async getCalendarData(startDate: string, endDate: string): Promise<CalendarData[]> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/kpi_calendar?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch calendar data: ${response.statusText}`);
    }
    return response.json();
  }
};

// Data transformation functions
export const transformBackendData = (backendData: KPIData[]) => {
  return backendData.map(item => ({
    batchName: item["Batch Name"],
    productName: item["Product Name"],
    batchStart: item["Batch Act Start"],
    batchEnd: item["Batch Act End"],
    batchQuantity: item["Quantity"],
    materialName: item["Material Name"],
    materialCode: item["Material Code"],
    setPoint: item["SetPoint Float"],
    actual: item["Actual Value Float"],
    orderId: item["OrderId"],
    batchGuid: item["Batch GUID"],
    sourceServer: item["Source Server"],
    rootGuid: item["ROOTGUID"],
    batchTransferTime: item["Batch Transfer Time"],
    formulaCategoryName: item["FormulaCategoryName"]
  }));
};

// Aggregate data for summary reports
export const aggregateByProduct = (data: any[], groupBy: 'day' | 'week' | 'month' = 'day') => {
  const grouped = data.reduce((acc, item) => {
    const date = new Date(item.batchStart);
    let periodKey: string;

    switch (groupBy) {
      case 'day':
        periodKey = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        periodKey = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        periodKey = date.toISOString().split('T')[0];
    }

    const key = `${periodKey}-${item.productName}`;

    if (!acc[key]) {
      acc[key] = {
        period: periodKey,
        productName: item.productName,
        noOfBatches: 0,
        sumSP: 0,
        sumAct: 0,
        errKg: 0,
        errPercent: 0
      };
    }

    acc[key].noOfBatches++;
    acc[key].sumSP += item.setPoint || 0;
    acc[key].sumAct += item.actual || 0;

    return acc;
  }, {} as any);

  return Object.values(grouped).map((item: any) => ({
    ...item,
    errKg: parseFloat((item.sumAct - item.sumSP).toFixed(2)),
    errPercent: parseFloat((((item.sumAct - item.sumSP) / item.sumSP) * 100).toFixed(2))
  }));
};

// Aggregate data for material consumption report
export const aggregateByMaterial = (data: any[]) => {
  const grouped = data.reduce((acc, item) => {
    const key = item.materialCode;

    if (!acc[key]) {
      acc[key] = {
        materialName: item.materialName,
        code: item.materialCode,
        plannedKG: 0,
        actualKG: 0,
        differencePercent: 0
      };
    }

    acc[key].plannedKG += item.setPoint || 0;
    acc[key].actualKG += item.actual || 0;

    return acc;
  }, {} as any);

  return Object.values(grouped).map((item: any) => ({
    ...item,
    plannedKG: parseFloat(item.plannedKG.toFixed(2)),
    actualKG: parseFloat(item.actualKG.toFixed(2)),
    differencePercent: parseFloat((((item.actualKG - item.plannedKG) / item.plannedKG) * 100).toFixed(2))
  }));
}; 