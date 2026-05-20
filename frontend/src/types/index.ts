export type DeviceStatus = 'available' | 'booked' | 'in_use' | 'maintenance'
export type SessionStatus = 'active' | 'completed' | 'cancelled'
export type BookingStatus = 'pending' | 'confirmed' | 'in_use' | 'completed' | 'rejected' | 'cancelled' | 'expired'
export type TransactionStatus = 'pending' | 'paid' | 'cancelled'
export type PaymentMethod = 'cash' | 'qris' | 'transfer'
export type UserRole = 'owner' | 'cashier'

export interface User { id: number; name: string; email: string; role: UserRole; is_active: boolean }
export interface Customer { id: number; name: string; phone: string | null; email: string | null }
export interface DeviceRate { id: number; price_per_hour: number; effective_from: string | null; effective_until: string | null; is_active: boolean }
export interface Device { id: number; name: string; ps_type: string; tv_ip_address: string | null; status: DeviceStatus; current_rate: DeviceRate | null; ps_sn: string; tv: string; tv_sn: string; tv_mac_address: string;}
export interface Booking { id: number; device_id: number; customer_id: number; booking_date: string; start_time: string; end_time: string; duration_minutes: number; estimated_cost: number; dp_amount: number; dp_proof_file: string | null; status: BookingStatus; cancel_reason: string | null; expires_at: string | null; created_at: string; device?: Device; customer?: Customer }
export interface TransactionItem { id: number; fnb_item_id: number | null; item_name: string; quantity: number; unit_price: number; subtotal: number }
export interface Transaction { id: number; session_id: number; invoice_number: string; gaming_total: number; fnb_total: number; grand_total: number; dp_paid: number; remaining_amount: number; amount_paid: number; change_amount: number; payment_method: PaymentMethod | null; status: TransactionStatus; paid_at: string | null; items?: TransactionItem[] }
export interface PlaySession { id: number; device_id: number; customer_id: number | null; booking_id: number | null; cashier_id: number; started_at: string; ended_at: string | null; duration_minutes: number | null; gaming_cost: number; status: SessionStatus; device?: Device; customer?: Customer | null; booking?: Booking | null; transaction?: Transaction }
export interface FnbCategory { id: number; name: string; is_active: boolean; items?: FnbItem[] }
export interface FnbItem { id: number; category_id: number; name: string; price: number; stock: number; is_available: boolean }
export interface AuthUser { id: number; name: string; email: string; role: UserRole }
export interface LoginResponse { user: AuthUser; token: string }
export interface ApiResponse<T> { data: T }
export interface PaginatedResponse<T> { data: T[]; current_page: number; last_page: number; total: number }
