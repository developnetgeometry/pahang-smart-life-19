import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useShoppingCart } from '@/hooks/use-shopping-cart';

interface CartIconProps {
  onClick: () => void;
  className?: string;
}

export default function CartIcon({ onClick, className }: CartIconProps) {
  const { cartCount } = useShoppingCart();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className={`relative ${className}`}
    >
      <ShoppingCart className="h-4 w-4" />
      {cartCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {cartCount > 99 ? '99+' : cartCount}
        </Badge>
      )}
    </Button>
  );
}