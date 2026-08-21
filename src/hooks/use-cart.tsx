import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  slug: string;
  variantId?: string;
  variantLabel?: string;
  customFileUrl?: string;
  customFileName?: string;
};

interface CartStore {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product, quantity = 1) => {
        set((state: CartStore) => {
          const itemKey = product.variantId 
            ? `${product.id}-${product.variantId}` 
            : product.id;
          
          const existingIndex = state.items.findIndex((item: CartItem) => {
            const existingKey = item.variantId 
              ? `${item.id}-${item.variantId}` 
              : item.id;
            return existingKey === itemKey;
          });

          if (existingIndex !== -1) {
            const newItems = [...state.items];
            const existingItem = newItems[existingIndex];
            newItems[existingIndex] = {
              ...existingItem,
              quantity: existingItem.quantity + quantity
            };
            return { items: newItems };
          }
          
          const newItem: CartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            slug: product.slug,
            quantity: quantity,
            variantId: product.variantId,
            variantLabel: product.variantLabel,
            customFileUrl: product.customFileUrl,
            customFileName: product.customFileName
          };
          
          return { items: [...state.items, newItem] };
        });
      },
      removeFromCart: (key: string) => {
        set((state: CartStore) => ({
          items: state.items.filter((item: CartItem) => {
            const itemKey = item.variantId 
              ? `${item.id}-${item.variantId}` 
              : item.id;
            return itemKey !== key;
          }),
        }));
      },
      updateQuantity: (key: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(key);
          return;
        }
        set((state: CartStore) => ({
          items: state.items.map((item: CartItem) => {
            const itemKey = item.variantId 
              ? `${item.id}-${item.variantId}` 
              : item.id;
            return itemKey === key ? { ...item, quantity } : item;
          }),
        }));
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((acc: number, item: CartItem) => acc + item.quantity, 0),
      totalPrice: () => get().items.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0),
    }),
    {
      name: 'ruth-mavis-cart-storage',
    }
  )
);
