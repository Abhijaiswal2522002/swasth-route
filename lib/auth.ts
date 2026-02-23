import ApiClient from './api';

export interface AuthUser {
  id: string;
  phone: string;
  name: string;
  email?: string;
  role: 'user' | 'pharmacy' | 'admin';
}

export class AuthManager {
  private static readonly TOKEN_KEY = 'token';
  private static readonly USER_KEY = 'user';
  private static readonly ROLE_KEY = 'role';

  static async loginUser(phone: string, password: string) {
    const response = await ApiClient.userLogin(phone, password);

    if (response.error) {
      throw new Error(response.error);
    }

    const data = response.data as any;
    this.setToken(data.token);
    this.setUser({
      id: data.user.id,
      phone: data.user.phone,
      name: data.user.name,
      email: data.user.email,
      role: 'user',
    });

    return data.user;
  }

  static async signupUser(phone: string, name: string, password: string, email?: string) {
    const response = await ApiClient.userSignUp(phone, name, password, email);

    if (response.error) {
      throw new Error(response.error);
    }

    const data = response.data as any;
    this.setToken(data.token);
    this.setUser({
      id: data.user.id,
      phone: data.user.phone,
      name: data.user.name,
      email: data.user.email,
      role: 'user',
    });

    return data.user;
  }

  static async loginPharmacy(phone: string, password: string) {
    const response = await ApiClient.pharmacyLogin(phone, password);

    if (response.error) {
      throw new Error(response.error);
    }

    const data = response.data as any;
    this.setToken(data.token);
    this.setUser({
      id: data.pharmacy.id,
      phone: data.pharmacy.phone,
      name: data.pharmacy.name,
      role: 'pharmacy',
    });

    return data.pharmacy;
  }

  static async signupPharmacy(
    name: string,
    phone: string,
    email: string,
    password: string,
    city: string,
    pincode: string,
    latitude: number,
    longitude: number
  ) {
    const response = await ApiClient.pharmacySignUp(
      name,
      phone,
      email,
      password,
      city,
      pincode,
      latitude,
      longitude
    );

    if (response.error) {
      throw new Error(response.error);
    }

    const data = response.data as any;
    this.setToken(data.token);
    this.setUser({
      id: data.pharmacy.id,
      phone: data.pharmacy.phone,
      name: data.pharmacy.name,
      role: 'pharmacy',
    });

    return data.pharmacy;
  }

  static async loginAdmin(adminId: string, password: string) {
    const response = await ApiClient.adminLogin(adminId, password);

    if (response.error) {
      throw new Error(response.error);
    }

    const data = response.data as any;
    this.setToken(data.token);
    this.setUser({
      id: data.admin.id,
      phone: '',
      name: 'Admin',
      role: 'admin',
    });

    return data.admin;
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  static getUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static setUser(user: AuthUser): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      localStorage.setItem(this.ROLE_KEY, user.role);
    }
  }

  static getRole(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ROLE_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.ROLE_KEY);
    }
  }
}

export default AuthManager;
