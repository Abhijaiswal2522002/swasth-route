'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { io, Socket } from 'socket.io-client';
import ApiClient from '@/lib/api';
import { toast } from 'sonner';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RiderContextType {
  profile: any;
  nearbyOrders: any[];
  activeOrder: any;
  isLoading: boolean;
  isOnline: boolean;
  currentLocation: { lat: number; lng: number } | null;
  earningsHistory: any[];
  isRegistering: boolean;
  handleToggleOnline: (checked: boolean) => Promise<void>;
  handleAcceptOrder: (orderId: string) => Promise<void>;
  handlePickup: () => Promise<void>;
  handleDeliver: () => Promise<void>;
  handleRejectOrder: (orderId: string) => Promise<void>;
  handleRegister: (data: { vehicleType: string; vehicleNumber: string }) => Promise<void>;
  fetchRiderData: () => Promise<void>;
}

const RiderContext = createContext<RiderContextType | undefined>(undefined);

export const RiderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [nearbyOrders, setNearbyOrders] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [earningsHistory, setEarningsHistory] = useState<any[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [offerTimer, setOfferTimer] = useState<number | null>(null);
  const [offeredOrder, setOfferedOrder] = useState<any>(null);

  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (user && user.role === 'rider') {
      fetchRiderData();
      initSocket();
      
      // Get initial location immediately even if offline
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
          },
          (err) => console.log('Initial geolocation failed, using default'),
          { enableHighAccuracy: false, timeout: 5000 }
        );
      }
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const initSocket = () => {
    if (!socketRef.current && user) {
      const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Rider Socket connected');
        socket.emit('join-room', `rider-${user.id}`);
      });

      socket.on('new-order-assignment', (data) => {
        console.log('New assignment received:', data);
        setOfferedOrder(data);
        
        // Start local timer
        const expiresAt = new Date(data.expiresAt).getTime();
        const now = new Date().getTime();
        const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setOfferTimer(diff);

        toast.info(`New Order Assigned: ${data.orderId}`, {
          description: `From ${data.pharmacyName}. Payout: ₹${data.payout}. You have ${diff}s to accept!`,
          duration: 180000,
        });
        fetchRiderData();
      });

      socket.on('order-revoked', (data) => {
        console.log('Order revoked:', data);
        toast.error(`Order ${data.orderId} is no longer available.`);
        setOfferedOrder(null);
        setOfferTimer(null);
        fetchRiderData();
      });

      socket.on('new-order-available', () => {
        console.log('New orders available nearby');
        fetchRiderData();
      });

      socket.on('order-updated', (data) => {
        console.log('Active order updated:', data);
        // Refresh active order state if it matches or if it's our offered order
        if ((activeOrder && data.dbId === activeOrder._id) || (offeredOrder && data.dbId === offeredOrder.dbId)) {
          fetchRiderData();
        }
      });
    }
  };

  // Socket cleanup
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const fetchRiderData = async () => {
    setIsLoading(true);
    try {
      const profileRes = await ApiClient.getRiderProfile();
      if (profileRes.data) {
        setProfile(profileRes.data);
        setIsOnline(profileRes.data.status !== 'offline');

        if (profileRes.data.activeOrder) {
          const orderRes = await ApiClient.getOrderDetails(profileRes.data.activeOrder);
          if (orderRes.data) setActiveOrder(orderRes.data);
        }
      }

      const ordersRes = await ApiClient.getNearbyOrders();
      if (ordersRes.data) setNearbyOrders(ordersRes.data);

      const earningsRes = await ApiClient.getRiderEarnings();
      if (earningsRes.data) {
        setEarningsHistory(earningsRes.data.history || []);
        // Update local profile state with latest earnings
        setProfile((prev: any) => prev ? { ...prev, totalEarnings: earningsRes.data.totalEarnings } : prev);
      }
    } catch (error) {
      console.error('Error fetching rider data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Timer effect for assignment offers
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (offerTimer !== null && offerTimer > 0) {
      interval = setInterval(() => {
        setOfferTimer(prev => (prev !== null && prev > 0) ? prev - 1 : 0);
      }, 1000);
    } else if (offerTimer === 0) {
      // Timer expired, clean up offer
      setOfferedOrder(null);
      setOfferTimer(null);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [offerTimer]);

  // Track location when online
  useEffect(() => {
    if (isOnline && navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });

          // Update backend
          ApiClient.updateRiderLocation(latitude, longitude);

          // Emit via socket if there's an active order
          if (activeOrder && socketRef.current) {
            socketRef.current.emit('update-location', {
              orderId: activeOrder._id,
              riderId: user?.id,
              latitude,
              longitude
            });
          }
        },
        (err) => console.error('Geolocation error:', err),
        { enableHighAccuracy: true }
      );
    } else {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    }

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isOnline, activeOrder, user]);

  const handleToggleOnline = async (checked: boolean) => {
    try {
      const status = checked ? 'available' : 'offline';
      const res = await ApiClient.updateRiderStatus(status as any);
      if (!res.error) {
        setIsOnline(checked);
        toast.success(checked ? "You're now online!" : "You're now offline.");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const res = await ApiClient.acceptRiderOrder(orderId);
      if (!res.error) {
        toast.success("Order accepted!");
        fetchRiderData();
        router.push('/rider/map');
      } else {
        if (res.error.includes("not assigned to you") || res.error.includes("no longer available")) {
          setOfferedOrder(null);
          setOfferTimer(null);
          toast.error("Offer Timed Out", {
            description: "This order is no longer assigned to you."
          });
          fetchRiderData();
        } else {
          toast.error(res.error);
        }
      }
    } catch (error) {
      toast.error("Failed to accept order");
    }
  };

  const handlePickup = async () => {
    if (!activeOrder) return;
    try {
      const res = await ApiClient.pickupOrder(activeOrder._id);
      if (!res.error) {
        toast.success("Order picked up!");
        fetchRiderData();
      }
    } catch (error) {
      toast.error("Pickup failed");
    }
  };

  const handleDeliver = async () => {
    if (!activeOrder) return;
    try {
      const res = await ApiClient.deliverOrder(activeOrder._id);
      if (!res.error) {
        toast.success("Delivery completed!");
        fetchRiderData();
        setActiveOrder(null);
        router.push('/rider/home');
      }
    } catch (error) {
      toast.error("Delivery completion failed");
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      const res = await ApiClient.rejectRiderOrder(orderId);
      if (!res.error) {
        toast.info("Order rejected");
        setOfferedOrder(null);
        setOfferTimer(null);
        fetchRiderData();
      } else {
        if (res.error.includes("not assigned to you")) {
          setOfferedOrder(null);
          setOfferTimer(null);
          toast.error("Offer Timed Out", {
            description: "This assignment had already expired."
          });
          fetchRiderData();
        } else {
          toast.error(res.error);
        }
      }
    } catch (error) {
      toast.error("Failed to reject order");
    }
  };

  const handleRegister = async (data: { vehicleType: string; vehicleNumber: string }) => {
    setIsRegistering(true);
    try {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const res = await ApiClient.registerRider({
          ...data,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });

        if (!res.error) {
          toast.success("Welcome aboard!");
          window.location.reload();
        } else {
          toast.error(res.error);
        }
      });
    } catch (error) {
      toast.error("Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <RiderContext.Provider value={{
      profile, nearbyOrders, activeOrder, isLoading, isOnline,
      currentLocation, earningsHistory, isRegistering,
      offerTimer, offeredOrder,
      handleToggleOnline, handleAcceptOrder, handlePickup, handleDeliver, handleRejectOrder,
      handleRegister, fetchRiderData
    }}>
      {children}
    </RiderContext.Provider>
  );
};

export const useRider = () => {
  const context = useContext(RiderContext);
  if (context === undefined) {
    throw new Error('useRider must be used within a RiderProvider');
  }
  return context;
};
