/**
 * Petpooja Webhook Event DTOs
 * Structures for handling Petpooja real-time order data
 */

export class PetpoojaRestaurant {
  name: string;
  address?: string;
  phone?: string;
  city?: string;
  state?: string;
  restID: string;
}

export class PetpoojaCustomer {
  name: string;
  phone?: string;
  email?: string;
  gstin?: string;
  address?: string;
}

export class PetpoojaOrder {
  token?: string;
  order_id: string;
  order_type: 'Dine In' | 'Pick Up' | 'Delivery';
  payment_type: 'Cash' | 'Card' | 'Online' | 'Other' | 'Part Payment';
  order_from: 'POS' | string;
  order_from_id?: string;
  sub_order_type?: string;
  status: 'Success' | 'Cancelled';
  total_amount: number;
  discount_amount?: number;
  tax_amount?: number;
  payment_status?: string;
  paid_amount?: number;
}

export class PetpoojaOrderItem {
  item_id?: string;
  item_name: string;
  item_size?: string;
  quantity: number;
  unit_price: number;
  item_total: number;
  addon_details?: string;
}

export class PetpoojaTax {
  tax_name: string;
  tax_percentage: number;
  tax_amount: number;
}

export class PetpoojaDiscount {
  discount_name: string;
  discount_type: 'percentage' | 'amount';
  discount_value: number;
  discount_amount: number;
}

export class PetpoojaWebhookPayload {
  event: 'orderdetails' | string;
  Restaurant: PetpoojaRestaurant;
  Customer: PetpoojaCustomer;
  Order: PetpoojaOrder;
  OrderItem?: PetpoojaOrderItem[];
  Tax?: PetpoojaTax[];
  Discount?: PetpoojaDiscount[];
  timestamp?: number;
}

export class PetpoojaSyncLog {
  id: string;
  outlet_id: string;
  sync_type: string;
  status: 'Success' | 'Failed' | 'Pending';
  records_synced: number;
  error_trace?: string;
  raw_response?: string;
  created_at: Date;
  updated_at: Date;
}

export class PetpoojaWebhookResponse {
  status: string;
  message: string;
  order_id?: string;
}

export class TriggerPetpoojaSyncDto {
  outlet_id: string;
  sync_type: 'orders' | 'inventory' | 'menu' | string;
}
