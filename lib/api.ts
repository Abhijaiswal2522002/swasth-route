const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    phone: string;
    name: string;
    role: 'user' | 'pharmacy' | 'admin' | 'rider';
    email?: string;
  };
}

export interface CaptchaData {
  id: string;
  question: string;
}

// Standalone auth functions for useAuth hook
export async function login(email: string, password: string): Promise<AuthResponse> {
  const url = `${API_URL}/auth/user/login`;
  console.log('[v0] Fetching login from:', url);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('[v0] Login response status:', response.status);
    const data = await response.json();
    console.log('[v0] Login response data:', data);

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Login failed');
    }

    return {
      token: data.token,
      user: {
        id: data.user._id || data.user.id,
        phone: data.user.phone,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role || 'user',
      },
    };
  } catch (error) {
    console.error('[v0] Login error:', error);
    throw error;
  }
}

export interface SignupResponse {
  message: string;
  redirect: string;
}

export async function signup(name: string, phone: string, email: string, password: string): Promise<SignupResponse> {
  const url = `${API_URL}/auth/user/signup`;
  console.log('[v0] Fetching signup from:', url);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, phone, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Signup failed');
    }

    return {
      message: data.message,
      redirect: data.redirect || '/auth/login',
    };
  } catch (error) {
    console.error('[v0] Signup error:', error);
    throw error;
  }
}

export async function getCaptcha(): Promise<CaptchaData> {
  const url = `${API_URL}/auth/captcha`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get CAPTCHA');
    }
    return data;
  } catch (error) {
    console.error('[v0] Get CAPTCHA error:', error);
    throw error;
  }
}

export async function pharmacySignup(
  name: string,
  phone: string,
  email: string,
  password: string,
  address: string,
  city: string,
  licenseNumber: string,
  latitude: number,
  longitude: number,
  captchaId: string,
  captchaAnswer: string
): Promise<SignupResponse> {
  const url = `${API_URL}/auth/pharmacy/signup`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name, phone, email, password, address, city,
        licenseNumber, latitude, longitude, captchaId, captchaAnswer,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Pharmacy registration failed');
    }

    return {
      message: data.message,
      redirect: data.redirect || '/auth/login',
    };
  } catch (error) {
    console.error('[v0] Pharmacy Signup error:', error);
    throw error;
  }
}

export async function riderSignup(
  name: string,
  phone: string,
  email: string,
  password: string,
  vehicleType: string,
  vehicleNumber: string,
  latitude: number,
  longitude: number
): Promise<SignupResponse> {
  const url = `${API_URL}/auth/rider/signup`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name, phone, email, password, vehicleType, vehicleNumber, latitude, longitude
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Rider registration failed');
    }

    return {
      message: data.message,
      redirect: data.redirect || '/auth/login',
    };
  } catch (error) {
    console.error('[v0] Rider Signup error:', error);
    throw error;
  }
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const url = `${API_URL}/auth/verify-email?token=${token}`;
  try {
    const response = await fetch(url, { redirect: 'follow' });

    // Guard: if the server returned HTML instead of JSON (e.g. an accidental redirect),
    // give a human-readable error rather than a cryptic JSON parse failure.
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Verification failed. Please try signing up again or contact support.');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Verification failed');
    }
    return data;
  } catch (error) {
    console.error('[v0] Verify Email error:', error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('[v0] Logout error:', error);
    }
  }
}

export class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_URL}${endpoint}`;
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      const headers: any = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // If body is FormData, delete Content-Type to let browser set boundary
      if (options.body instanceof FormData) {
        delete headers['Content-Type'];
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`[v0] API Request: ${options.method || 'GET'} ${endpoint} - Status: ${response.status}`);
      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || 'An error occurred' };
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An error occurred' };
    }
  }

  // Auth endpoints - kept for backwards compatibility
  static async userSignUp(phone: string, name: string, password: string, email: string) {
    return this.request('/auth/user/signup', {
      method: 'POST',
      body: JSON.stringify({ phone, name, password, email }),
    });
  }

  static async userLogin(email: string, password: string) {
    return this.request('/auth/user/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async pharmacySignUp(
    name: string,
    phone: string,
    email: string,
    password: string,
    address: string,
    city: string,
    licenseNumber: string,
    latitude: number,
    longitude: number,
    captchaId: string,
    captchaAnswer: string
  ) {
    return this.request('/auth/pharmacy/signup', {
      method: 'POST',
      body: JSON.stringify({
        name,
        phone,
        email,
        password,
        address,
        city,
        licenseNumber,
        latitude,
        longitude,
        captchaId,
        captchaAnswer,
      }),
    });
  }

  static async riderSignUp(
    name: string,
    phone: string,
    email: string,
    password: string,
    vehicleType: string,
    vehicleNumber: string,
    latitude: number,
    longitude: number
  ) {
    return this.request('/auth/rider/signup', {
      method: 'POST',
      body: JSON.stringify({
        name,
        phone,
        email,
        password,
        vehicleType,
        vehicleNumber,
        latitude,
        longitude,
      }),
    });
  }

  static async pharmacyLogin(phone: string, password: string) {
    return this.request('/auth/pharmacy/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
  }

  static async adminLogin(adminId: string, password: string) {
    return this.request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ adminId, password }),
    });
  }

  static async forgotPassword(contact: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ contact }),
    });
  }

  static async resetPassword(token: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // Cart endpoints
  static async getCart() {
    return this.request<any>('/cart');
  }

  static async addToCart(medicineId: string, pharmacyId: string, medicineName: string, price: number) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ medicineId, pharmacyId, medicineName, price }),
    });
  }

  static async updateCartQuantity(medicineId: string, pharmacyId: string, quantity: number) {
    return this.request('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ medicineId, pharmacyId, quantity }),
    });
  }

  static async removeFromCart(medicineId: string, pharmacyId: string) {
    return this.request(`/cart/item/${medicineId}/${pharmacyId}`, {
      method: 'DELETE',
    });
  }

  static async clearCart() {
    return this.request('/cart/clear', {
      method: 'DELETE',
    });
  }

  // User endpoints
  static async getUserProfile() {
    return this.request<any>('/users/profile');
  }

  static async updateUserProfile(data: any) {
    const isFormData = data instanceof FormData;
    return this.request('/users/profile', {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  static async addAddress(
    label: string,
    street: string,
    city: string,
    state: string,
    pincode: string,
    latitude: number,
    longitude: number,
    isDefault?: boolean
  ) {
    return this.request('/users/addresses', {
      method: 'POST',
      body: JSON.stringify({
        label,
        street,
        city,
        state,
        pincode,
        latitude,
        longitude,
        isDefault,
      }),
    });
  }

  static async getAddresses() {
    return this.request<any[]>('/users/addresses');
  }

  static async addToFavorites(pharmacyId: string, medicineId: string) {
    return this.request('/users/favorites', {
      method: 'POST',
      body: JSON.stringify({ pharmacyId, medicineId }),
    });
  }

  static async getFavorites() {
    return this.request('/users/favorites');
  }

  // Pharmacy endpoints
  static async getNearbyPharmacies(latitude: number, longitude: number, maxDistance?: number) {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      ...(maxDistance && { maxDistance: maxDistance.toString() }),
    });
    return this.request<any[]>(`/pharmacies/nearby?${params}`);
  }

  static async getPharmacyDetails(id: string) {
    return this.request(`/pharmacies/${id}`);
  }

  static async searchPharmacyMedicines(pharmacyId: string, query: string) {
    const params = new URLSearchParams({ query });
    return this.request<any[]>(`/pharmacies/${pharmacyId}/medicines?${params}`);
  }

  // Order endpoints
  static async createOrder(
    pharmacyId: string,
    items: Array<{ medicineId: string; medicineName: string; quantity: number; price: number; subtotal: number }>,
    deliveryAddress: any,
    isEmergency?: boolean,
    paymentMethod?: string,
    notes?: string
  ) {
    return this.request('/orders/create', {
      method: 'POST',
      body: JSON.stringify({
        pharmacyId,
        items,
        deliveryAddress,
        isEmergency,
        paymentMethod,
        notes,
      }),
    });
  }

  static async getUserOrders() {
    return this.request<any[]>('/orders/user/list');
  }

  static async getOrderDetails(orderId: string) {
    return this.request(`/orders/${orderId}`);
  }

  static async cancelOrder(orderId: string, reason: string) {
    return this.request(`/orders/${orderId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  static async rateOrder(orderId: string, score: number, comment: string) {
    return this.request(`/orders/${orderId}/rate`, {
      method: 'PUT',
      body: JSON.stringify({ score, comment }),
    });
  }

  // Pharmacy dashboard endpoints
  static async getPharmacyProfile() {
    return this.request('/pharmacies/profile');
  }

  static async updatePharmacyProfile(data: any) {
    const isFormData = data instanceof FormData;
    return this.request('/pharmacies/profile', {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  static async getPharmacyOrders(status?: string) {
    const params = new URLSearchParams(status ? { status } : {});
    return this.request<any[]>(`/pharmacies/orders/list?${params}`);
  }

  static async updateOrderStatus(orderId: string, status: string, notes?: string) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  static async acceptOrder(orderId: string) {
    return this.request(`/orders/${orderId}/accept`, {
      method: 'PUT',
      body: JSON.stringify({}),
    });
  }

  static async rejectOrder(orderId: string, reason: string) {
    return this.request(`/orders/${orderId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  static async updateTracking(orderId: string, latitude: number, longitude: number, deliveryAgent?: any) {
    return this.request(`/orders/${orderId}/tracking`, {
      method: 'PUT',
      body: JSON.stringify({ latitude, longitude, deliveryAgent }),
    });
  }

  static async getPharmacyAnalytics() {
    return this.request<any>('/pharmacies/analytics');
  }

  // Medicine catalog endpoints
  static async getMedicinesCatalog(search?: string, category?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    return this.request<any[]>(`/medicines?${params}`);
  }

  static async addMedicineToCatalog(data: any) {
    return this.request('/medicines', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async addMedicine(medicineName: string, quantity: number, price: number, reorderLevel: number, medicineId?: string) {
    return this.request('/pharmacies/inventory/add', {
      method: 'POST',
      body: JSON.stringify({ medicineName, quantity, price, reorderLevel, medicineId }),
    });
  }

  static async updateInventory(medicineId: string, quantity: number, price?: number) {
    return this.request(`/pharmacies/inventory/${medicineId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity, price }),
    });
  }

  // Admin endpoints
  static async getAllPharmacies(status?: string, city?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (city) params.append('city', city);
    return this.request(`/admin/pharmacies?${params}`);
  }

  static async approvePharmacy(pharmacyId: string) {
    return this.request(`/admin/pharmacies/${pharmacyId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({}),
    });
  }

  static async rejectPharmacy(pharmacyId: string, reason: string) {
    return this.request(`/admin/pharmacies/${pharmacyId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  static async updateCommissionRate(pharmacyId: string, commissionRate: number) {
    return this.request(`/admin/pharmacies/${pharmacyId}/commission`, {
      method: 'PUT',
      body: JSON.stringify({ commissionRate }),
    });
  }

  static async getAdminAnalytics() {
    return this.request('/admin/analytics/dashboard');
  }

  static async getRevenueAnalytics() {
    return this.request('/admin/analytics/revenue');
  }

  static async getAllUsers() {
    return this.request('/admin/users');
  }

  static async deactivateUser(userId: string) {
    return this.request(`/admin/users/${userId}/deactivate`, {
      method: 'PUT',
      body: JSON.stringify({}),
    });
  }


  static async reactivateUser(userId: string) {
    return this.request(`/admin/users/${userId}/reactivate`, {
      method: 'PUT',
      body: JSON.stringify({}),
    });
  }

  static async getAllOrders(status?: string) {
    const params = new URLSearchParams(status ? { status } : {});
    return this.request(`/admin/orders?${params}`);
  }

  // Rider endpoints
  static async registerRider(data: { vehicleType: string; vehicleNumber: string; latitude: number; longitude: number }) {
    return this.request('/rider/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getRiderProfile() {
    return this.request<any>('/rider/profile');
  }

  static async updateRiderStatus(status: 'offline' | 'available' | 'busy') {
    return this.request('/rider/status', {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  static async updateRiderLocation(latitude: number, longitude: number) {
    return this.request('/rider/location', {
      method: 'PUT',
      body: JSON.stringify({ latitude, longitude }),
    });
  }

  static async getNearbyOrders() {
    return this.request<any[]>('/rider/nearby-orders');
  }

  static async acceptRiderOrder(orderId: string) {
    return this.request(`/rider/orders/${orderId}/accept`, {
      method: 'PUT',
      body: JSON.stringify({}),
    });
  }

  static async pickupOrder(orderId: string) {
    return this.request(`/rider/orders/${orderId}/pickup`, {
      method: 'PUT',
      body: JSON.stringify({}),
    });
  }

  static async deliverOrder(orderId: string) {
    return this.request(`/rider/orders/${orderId}/deliver`, {
      method: 'PUT',
      body: JSON.stringify({}),
    });
  }
}

export default ApiClient;
