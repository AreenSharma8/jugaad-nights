import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";

// ========== OUTLETS QUERIES ==========
export const useOutlets = () => {
  return useQuery({
    queryKey: ["outlets"],
    queryFn: () => apiClient.getOutlets().then((res) => res.data.data),
  });
};

export const useOutlet = (id: string) => {
  return useQuery({
    queryKey: ["outlet", id],
    queryFn: () => apiClient.getOutletById(id).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useCreateOutlet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.createOutlet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outlets"] });
    },
  });
};

export const useUpdateOutlet = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.updateOutlet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outlet", id] });
      queryClient.invalidateQueries({ queryKey: ["outlets"] });
    },
  });
};

// ========== SALES QUERIES ==========
export const useOrders = (outlet_id?: string) => {
  return useQuery({
    queryKey: ["orders", outlet_id],
    queryFn: () => apiClient.getOrders(outlet_id).then((res) => res.data.data),
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => apiClient.getOrderById(id).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useSalesTrends = (outlet_id: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["sales-trends", outlet_id, startDate, endDate],
    queryFn: () =>
      apiClient.getSalesTrends(outlet_id, startDate, endDate).then((res) => res.data.data),
    enabled: !!outlet_id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.createOrder(data),
    onSuccess: (response: any) => {
      // Invalidate with specific outlet_id to refresh the correct query
      queryClient.invalidateQueries({ queryKey: ["orders", response.data?.outlet_id] });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.updateOrder(id, data),
    onSuccess: (response: any) => {
      // Invalidate with specific outlet_id to refresh the correct query
      queryClient.invalidateQueries({ queryKey: ["orders", response.data?.outlet_id] });
    },
  });
};

export const useAddPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.addPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

// ========== INVENTORY QUERIES ==========
export const useInventory = (outlet_id?: string) => {
  return useQuery({
    queryKey: ["inventory", outlet_id],
    queryFn: () => apiClient.getInventory(outlet_id).then((res) => res.data.data),
  });
};

export const useLowStockItems = (outlet_id: string) => {
  return useQuery({
    queryKey: ["low-stock", outlet_id],
    queryFn: () => apiClient.getLowStockItems(outlet_id).then((res) => res.data.data),
    enabled: !!outlet_id,
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.createInventoryItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

export const useUpdateInventoryItem = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.updateInventoryItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

export const useRecordStockTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.recordStockTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

// ========== WASTAGE QUERIES ==========
export const useWastage = (outlet_id?: string) => {
  return useQuery({
    queryKey: ["wastage", outlet_id],
    queryFn: () => apiClient.getWastage(outlet_id).then((res) => res.data.data),
  });
};

export const useWastageAnalytics = (outlet_id: string) => {
  return useQuery({
    queryKey: ["wastage-analytics", outlet_id],
    queryFn: () => apiClient.getWastageAnalytics(outlet_id).then((res) => res.data.data),
    enabled: !!outlet_id,
  });
};

export const useLogWastage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.logWastage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wastage"] });
    },
  });
};

// ========== PARTY ORDERS QUERIES ==========
export const usePartyOrders = (outlet_id?: string) => {
  return useQuery({
    queryKey: ["party-orders", outlet_id],
    queryFn: () => apiClient.getPartyOrders(outlet_id).then((res) => res.data.data),
  });
};

export const usePartyOrder = (id: string) => {
  return useQuery({
    queryKey: ["party-order", id],
    queryFn: () => apiClient.getPartyOrderById(id).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useCreatePartyOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.createPartyOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-orders"] });
    },
  });
};

export const useUpdatePartyOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.updatePartyOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party-orders"] });
    },
  });
};

// ========== ATTENDANCE QUERIES ==========
export const useAttendance = (outlet_id?: string) => {
  return useQuery({
    queryKey: ["attendance", outlet_id],
    queryFn: () => apiClient.getAttendance(outlet_id).then((res) => res.data.data),
  });
};

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.checkIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
};

export const useCheckOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      apiClient.checkOut(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
};

// ========== CASHFLOW QUERIES ==========
export const useCashFlow = (outlet_id?: string) => {
  return useQuery({
    queryKey: ["cash-flow", outlet_id],
    queryFn: () => apiClient.getCashFlow(outlet_id).then((res) => res.data.data),
  });
};

export const useCashFlowSummary = (outlet_id: string) => {
  return useQuery({
    queryKey: ["cash-flow-summary", outlet_id],
    queryFn: () => apiClient.getCashFlowSummary(outlet_id).then((res) => res.data.data),
    enabled: !!outlet_id,
  });
};

export const useAddCashFlowEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.addCashFlowEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-flow"] });
      queryClient.invalidateQueries({ queryKey: ["cash-flow-summary"] });
    },
  });
};

// ========== ANALYTICS QUERIES ==========
export const useDashboardMetrics = (outlet_id: string) => {
  return useQuery({
    queryKey: ["dashboard-metrics", outlet_id],
    queryFn: () => apiClient.getDashboardMetrics(outlet_id).then((res) => res.data.data),
    enabled: !!outlet_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useOutletComparison = (outlet_ids: string[]) => {
  return useQuery({
    queryKey: ["outlet-comparison", outlet_ids],
    queryFn: () => apiClient.getOutletComparison(outlet_ids).then((res) => res.data.data),
    enabled: outlet_ids.length > 0,
  });
};

export const useSalesTrendAnalytics = (outlet_id: string, period?: string, days?: number) => {
  return useQuery({
    queryKey: ["sales-trend-analytics", outlet_id, period, days],
    queryFn: () =>
      apiClient.getSalesTrendAnalytics(outlet_id, period, days).then((res) => res.data.data),
    enabled: !!outlet_id,
  });
};

export const useInventoryHealth = (outlet_id: string) => {
  return useQuery({
    queryKey: ["inventory-health", outlet_id],
    queryFn: () => apiClient.getInventoryHealth(outlet_id).then((res) => res.data.data),
    enabled: !!outlet_id,
  });
};

// ========== REPORTS QUERIES ==========
export const useGenerateSummaryReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (outlet_id: string) => apiClient.generateSummaryReport(outlet_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

export const useGenerateSalesReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiClient.generateSalesReport(data.outlet_id, data.format, data.startDate, data.endDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

export const useGenerateInventoryReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.generateInventoryReport(data.outlet_id, data.format),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

export const useReports = (outlet_id?: string) => {
  return useQuery({
    queryKey: ["reports", outlet_id],
    queryFn: () => apiClient.getReports(outlet_id!).then((res) => res.data.data),
    enabled: !!outlet_id,
  });
};

export const useDownloadReport = () => {
  return useMutation({
    mutationFn: (id: string) => apiClient.downloadReport(id),
  });
};

// ========== PURCHASE ORDERS QUERIES ==========
export const usePurchaseOrders = (outlet_id?: string) => {
  return useQuery({
    queryKey: ["purchase-orders", outlet_id],
    queryFn: () => apiClient.getPurchaseOrders(outlet_id).then((res) => res.data.data),
    enabled: false, // Endpoint not yet implemented in backend
  });
};

export const useApprovePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.approvePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
};

export const useRejectPurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.rejectPurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
};

// ========== FESTIVALS QUERIES ==========
export const useFestivals = (outlet_id?: string) => {
  return useQuery({
    queryKey: ["festivals", outlet_id],
    queryFn: () => apiClient.getFestivals(outlet_id).then((res) => res.data.data),
    enabled: false, // Endpoint not yet implemented in backend
  });
};
