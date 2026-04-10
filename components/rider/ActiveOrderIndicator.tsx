import React from 'react';
import { Package, ChevronRight, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ActiveOrderIndicatorProps {
  order: any;
  onClick: () => void;
}

const ActiveOrderIndicator: React.FC<ActiveOrderIndicatorProps> = ({ order, onClick }) => {
  if (!order) return null;

  return (
    <div 
      onClick={onClick}
      className="fixed bottom-20 left-4 right-4 bg-zinc-900 text-white rounded-[1.5rem] p-4 shadow-2xl z-40 flex items-center justify-between cursor-pointer animate-in slide-in-from-bottom duration-500 hover:bg-zinc-800 transition-all border border-white/10"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
          <Package className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-black text-sm text-white tracking-tight truncate max-w-[150px]">
              {order.pharmacyId?.name || 'Active Delivery'}
            </h4>
            <Badge className="bg-primary/20 text-primary border-primary/30 rounded-lg px-2 py-0.5 text-[8px] font-black uppercase">
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-[10px] font-bold text-white/50 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" /> {order.deliveryAddress?.street}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right mr-2 hidden sm:block">
          <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Earning</p>
          <p className="text-sm font-black text-white">₹{order.deliveryFee || 50}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-white/30" />
      </div>
    </div>
  );
};

export default ActiveOrderIndicator;
