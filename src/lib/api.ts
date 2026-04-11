import axios, { AxiosInstance, AxiosError } from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface ApiResponse<T = any> {
  status: "success" | "error";
  data?: T;
  message?: string;
  code?: string;
  timestamp: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BACKEND_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Always attach latest token from localStorage for each request.
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // 401s can happen during expired session flows; avoid noisy console spam.
        if (error.response?.status !== 401) {
          console.error("API Error:", error);
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.client.post<ApiResponse>("/auth/login", { email, password });
  }

  // Users endpoints
  async getUsers(outlet_id?: string) {
    return this.client.get<ApiResponse>("/users", {
      params: { outlet_id },
    });
  }

  async getUserById(id: string) {
    return this.client.get<ApiResponse>(`/users/${id}`);
  }

  async createUser(userData: any) {
    return this.client.post<ApiResponse>("/users", userData);
  }

  async updateUser(id: string, userData: any) {
    return this.client.patch<ApiResponse>(`/users/${id}`, userData);
  }

  async deleteUser(id: string) {
    return this.client.delete<ApiResponse>(`/users/${id}`);
  }

  // Outlets endpoints
  async getOutlets() {
    return this.client.get<ApiResponse>("/outlets");
  }

  async getOutletById(id: string) {
    return this.client.get<ApiResponse>(`/outlets/${id}`);
  }

  async createOutlet(outletData: any) {
    return this.client.post<ApiResponse>("/outlets", outletData);
  }

  async updateOutlet(id: string, outletData: any) {
    return this.client.patch<ApiResponse>(`/outlets/${id}`, outletData);
  }

  async deleteOutlet(id: string) {
    return this.client.delete<ApiResponse>(`/outlets/${id}`);
  }

  // Sales endpoints
  async createOrder(orderData: any) {
    return this.client.post<ApiResponse>("/sales", orderData);
  }

  async getOrders(outlet_id?: string) {
    return this.client.get<ApiResponse>("/sales", {
      params: { outlet_id },
    });
  }

  async getOrderById(id: string) {
    return this.client.get<ApiResponse>(`/sales/${id}`);
  }

  async updateOrder(id: string, orderData: any) {
    return this.client.patch<ApiResponse>(`/sales/${id}`, orderData);
  }

  async getSalesTrends(outlet_id: string, startDate?: string, endDate?: string) {
    return this.client.get<ApiResponse>("/sales/trends", {
      params: { outlet_id, startDate, endDate },
    });
  }

  async addPayment(orderData: any) {
    return this.client.post<ApiResponse>("/sales/payments", orderData);
  }

  // Inventory endpoints
  async getInventory(outlet_id?: string) {
    return this.client.get<ApiResponse>("/inventory", {
      params: { outlet_id },
    });
  }

  async createInventoryItem(itemData: any) {
    return this.client.post<ApiResponse>("/inventory", itemData);
  }

  async updateInventoryItem(id: string, itemData: any) {
    return this.client.patch<ApiResponse>(`/inventory/${id}`, itemData);
  }

  async getLowStockItems(outlet_id: string) {
    return this.client.get<ApiResponse>("/inventory/low-stock", {
      params: { outlet_id },
    });
  }

  async recordStockTransaction(transactionData: any) {
    return this.client.post<ApiResponse>("/inventory/transactions", transactionData);
  }

  // Wastage endpoints
  async logWastage(wastageData: any) {
    return this.client.post<ApiResponse>("/wastage", wastageData);
  }

  async getWastage(outlet_id?: string) {
    return this.client.get<ApiResponse>("/wastage", {
      params: { outlet_id },
    });
  }

  async getWastageAnalytics(outlet_id: string) {
    return this.client.get<ApiResponse>("/wastage/analytics", {
      params: { outlet_id },
    });
  }

  // Party Orders endpoints
  async createPartyOrder(orderData: any) {
    return this.client.post<ApiResponse>("/party-orders", orderData);
  }

  async getPartyOrders(outlet_id?: string) {
    return this.client.get<ApiResponse>("/party-orders", {
      params: { outlet_id },
    });
  }

  async getPartyOrderById(id: string) {
    return this.client.get<ApiResponse>(`/party-orders/${id}`);
  }

  async updatePartyOrderStatus(id: string, status: string) {
    return this.client.patch<ApiResponse>(`/party-orders/${id}/status`, { status });
  }

  // Purchase Orders endpoints
  async getPurchaseOrders(outlet_id?: string) {
    return this.client.get<ApiResponse>("/purchase-orders", {
      params: { outlet_id },
    });
  }

  async createPurchaseOrder(orderData: any) {
    return this.client.post<ApiResponse>("/purchase-orders", orderData);
  }

  async updatePurchaseOrderStatus(id: string, status: string) {
    return this.client.patch<ApiResponse>(`/purchase-orders/${id}/status`, { status });
  }

  async approvePurchaseOrder(id: string) {
    return this.client.patch<ApiResponse>(`/purchase-orders/${id}/approve`, {});
  }

  async rejectPurchaseOrder(id: string) {
    return this.client.patch<ApiResponse>(`/purchase-orders/${id}/reject`, {});
  }

  // Festivals endpoints
  async getFestivals(outlet_id: string) {
    return this.client.get<ApiResponse>("/analytics/festivals", {
      params: { outlet_id },
    });
  }

  async getFestivalById(id: string) {
    return this.client.get<ApiResponse>(`/analytics/festivals/${id}`);
  }

  async createFestival(festivalData: any) {
    return this.client.post<ApiResponse>("/analytics/festivals", festivalData);
  }

  async updateFestival(id: string, festivalData: any) {
    return this.client.patch<ApiResponse>(`/analytics/festivals/${id}`, festivalData);
  }

  async deleteFestival(id: string) {
    return this.client.delete<ApiResponse>(`/analytics/festivals/${id}`);
  }

  async getFestivalMetrics(festivalId: string, outlet_id: string) {
    return this.client.get<ApiResponse>(`/analytics/festivals/${festivalId}/metrics`, {
      params: { outlet_id },
    });
  }

  // Attendance endpoints
  async checkIn(attendanceData: any) {
    return this.client.post<ApiResponse>("/attendance/checkin", attendanceData);
  }

  async checkOut(id: string, notes?: string) {
    return this.client.post<ApiResponse>("/attendance/checkout", { attendance_id: id, notes });
  }

  async getAttendance(outlet_id?: string) {
    return this.client.get<ApiResponse>("/attendance", {
      params: { outlet_id },
    });
  }

  // Cashflow endpoints
  async addCashFlowEntry(entryData: any) {
    return this.client.post<ApiResponse>("/cash-flow", entryData);
  }

  async getCashFlow(outlet_id?: string) {
    return this.client.get<ApiResponse>("/cash-flow", {
      params: { outlet_id },
    });
  }

  async getCashFlowSummary(outlet_id: string) {
    return this.client.get<ApiResponse>("/cash-flow/summary", {
      params: { outlet_id },
    });
  }

  // Analytics endpoints
  async getDashboardMetrics(outlet_id: string, forceRefresh?: boolean) {
    return this.client.get<ApiResponse>("/analytics/dashboard", {
      params: { outlet_id, force_refresh: forceRefresh },
    });
  }

  async getOutletComparison(outlet_ids: string[]) {
    return this.client.get<ApiResponse>("/analytics/comparison", {
      params: { outlet_ids: outlet_ids.join(",") },
    });
  }

  async getSalesTrendAnalytics(outlet_id: string, period?: string, days?: number) {
    return this.client.get<ApiResponse>("/analytics/trends", {
      params: { outlet_id, period, days },
    });
  }

  async getInventoryHealth(outlet_id: string) {
    return this.client.get<ApiResponse>("/analytics/inventory-health", {
      params: { outlet_id },
    });
  }

  // Reports endpoints
  async generateSummaryReport(outlet_id: string) {
    return this.client.post<ApiResponse>("/reports/generate/summary", { outlet_id });
  }

  async generateSalesReport(outlet_id: string, format?: string, startDate?: Date, endDate?: Date) {
    return this.client.post<ApiResponse>("/reports/generate/sales", {
      outlet_id,
      start_date: startDate,
      end_date: endDate,
      format,
    });
  }

  async generateInventoryReport(outlet_id: string, format?: string) {
    return this.client.post<ApiResponse>("/reports/generate/inventory", {
      outlet_id,
      format,
    });
  }

  async getReports(outlet_id: string) {
    return this.client.get<ApiResponse>("/reports", {
      params: { outlet_id },
    });
  }

  async downloadReport(id: string) {
    return this.client.get(`/reports/${id}/download`, {
      responseType: "blob",
    });
  }

  // Set authorization token
  setAuthToken(token: string) {
    if (token) {
      this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common["Authorization"];
    }
  }

  // Get the axios instance for custom requests
  getClient() {
    return this.client;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
