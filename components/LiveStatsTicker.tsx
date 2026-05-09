'use client';

import { TrendingUp, Users, Package, MapPin } from 'lucide-react';

const stats = [
  { label: 'Deliveries Completed', value: '12,840+', icon: Package, color: 'text-blue-600' },
  { label: 'Verified Pharmacies', value: '540+', icon: Users, color: 'text-teal-600' },
  { label: 'Active Cities', value: '28', icon: MapPin, color: 'text-orange-600' },
  { label: 'Avg. Delivery Time', value: '14.2m', icon: TrendingUp, color: 'text-green-600' },
];

export default function LiveStatsTicker() {
  return (
    <div className="bg-gray-50 border-y border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-2 group">
               <div className={`p-3 rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
               </div>
               <div>
                  <div className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
