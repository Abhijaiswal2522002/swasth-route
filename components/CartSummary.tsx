import { Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartSummaryProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  isLoading?: boolean;
}

export function CartSummary({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isLoading = false,
}: CartSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05);
  const deliveryFee = 50;
  const total = subtotal + tax + deliveryFee;

  if (items.length === 0) {
    return (
      <Card className="border border-border">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Your cart is empty</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Cart Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex-1">
                <p className="font-medium text-foreground line-clamp-1">{item.name}</p>
                <p className="text-sm text-muted-foreground">₹{item.price}</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                  className="rounded-full bg-secondary p-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="rounded-full bg-secondary p-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="rounded-full bg-red-50 dark:bg-red-950/20 p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (5%)</span>
            <span className="font-medium">₹{tax}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span className="font-medium">₹{deliveryFee}</span>
          </div>

          {/* Total */}
          <div className="flex justify-between border-t border-border pt-4">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-lg font-bold text-primary">₹{total}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onCheckout}
          disabled={isLoading || items.length === 0}
        >
          {isLoading ? 'Processing...' : 'Proceed to Checkout'}
        </Button>
      </CardContent>
    </Card>
  );
}
