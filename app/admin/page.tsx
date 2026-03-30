'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users, ShoppingCart, DollarSign, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import ApiClient from '@/lib/api';

interface DashboardData {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    activePharmacies: number;
}

export default function AdminDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await ApiClient.getAdminAnalytics();
                if (!res.error) {
                    setData(res.data as DashboardData);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading Dashboard...</div>;
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your platform</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                <Card className="hover:shadow-lg transition">
                    <CardContent className="p-5 flex justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Users</p>
                            <h2 className="text-2xl font-bold">{data?.totalUsers}</h2>
                        </div>
                        <Users className="w-8 h-8 text-primary/30" />
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition">
                    <CardContent className="p-5 flex justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Orders</p>
                            <h2 className="text-2xl font-bold">{data?.totalOrders}</h2>
                        </div>
                        <ShoppingCart className="w-8 h-8 text-primary/30" />
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition">
                    <CardContent className="p-5 flex justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Revenue</p>
                            <h2 className="text-2xl font-bold">₹{data?.totalRevenue}</h2>
                        </div>
                        <DollarSign className="w-8 h-8 text-primary/30" />
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition">
                    <CardContent className="p-5 flex justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Pharmacies</p>
                            <h2 className="text-2xl font-bold">{data?.activePharmacies}</h2>
                        </div>
                        <Activity className="w-8 h-8 text-primary/30" />
                    </CardContent>
                </Card>

            </div>

            {/* Recent Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                <Card>
                    <CardContent className="p-5">
                        <h3 className="font-semibold mb-3">Top Pharmacies</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>Apollo Pharmacy</p>
                            <p>MedPlus</p>
                            <p>Guardian</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <h3 className="font-semibold mb-3">Recent Activity</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>New user registered</p>
                            <p>Order #123 delivered</p>
                            <p>Pharmacy approved</p>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
