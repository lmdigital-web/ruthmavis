import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingBag, X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Link } from "@tanstack/react-router";

export function CartDrawer({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md border-gold/10 bg-white shadow-xl">
        <SheetHeader className="border-b border-gold/10 pb-4">
          <SheetTitle className="flex items-center gap-2 font-serif text-2xl text-primary">
            <ShoppingBag className="text-gold" /> Your Bag ({totalItems})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-hidden py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
              <div className="rounded-full bg-blush/20 p-6 text-burgundy/30">
                <ShoppingBag size={48} strokeWidth={1} />
              </div>
              <p className="text-muted-foreground">Your bag is currently empty.</p>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="border-gold/30 text-primary hover:bg-gold/5"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-6">
                {items.map((item) => (
                   <div key={`${item.id}-${item.variantId || 'base'}`} className="flex gap-4 pb-4 border-b border-gold/10">
                     <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gold/10">
                       <img
                         src={item.image_url}
                         alt={item.name}
                         className="h-full w-full object-cover"
                       />
                     </div>
                     <div className="flex flex-1 flex-col justify-between py-1">
                       <div className="flex justify-between gap-2">
                         <Link 
                           to="/product/$slug" 
                           params={{ slug: item.slug }}
                           onClick={() => onOpenChange(false)}
                           className="font-medium text-primary hover:underline line-clamp-1"
                         >
                           {item.name}
                         </Link>
                         <button 
                           onClick={() => removeFromCart(`${item.id}-${item.variantId || 'base'}`)}
                           className="text-muted-foreground hover:text-burgundy"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                       
                       {/* Show variant if selected */}
                       {item.variantLabel && (
                         <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                       )}
                       
                       {/* Show custom file if uploaded */}
                       {item.customFileName && (
                         <p className="text-xs text-green-600">📎 {item.customFileName}</p>
                       )}
                       
                       <div className="flex items-center justify-between">
                         <div className="flex items-center rounded-full border border-gold/20 bg-white/50 px-1 py-1">
                           <button
                             onClick={() => updateQuantity(`${item.id}-${item.variantId || 'base'}`, item.quantity - 1)}
                             className="rounded-full p-1 hover:bg-gold/10"
                           >
                             <Minus size={12} />
                           </button>
                           <span className="w-8 text-center text-xs font-medium">
                             {item.quantity}
                           </span>
                           <button
                             onClick={() => updateQuantity(`${item.id}-${item.variantId || 'base'}`, item.quantity + 1)}
                             className="rounded-full p-1 hover:bg-gold/10"
                           >
                             <Plus size={12} />
                           </button>
                        </div>
                        <span className="font-serif text-sm font-semibold text-burgundy">
                          R {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-t border-gold/10 pt-6">
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between border-b border-gold/5 pb-4">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-serif text-xl font-bold text-primary">
                  R {totalPrice.toFixed(2)}
                </span>
              </div>
              <Button asChild className="w-full bg-burgundy py-6 text-lg hover:bg-burgundy/90 transition-all active:scale-[0.98]">
                <Link to="/checkout" onClick={() => onOpenChange(false)} className="flex items-center justify-center w-full h-full">
                  Checkout Now
                </Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground italic">
                Shipping calculated at next step
              </p>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
