import { useState, useEffect } from 'react';

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

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('ruth_mavis_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('ruth_mavis_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((current) => {
      const itemKey = product.variantId 
        ? `${product.id}-${product.variantId}` 
        : product.id;
      const existing = current.find((item) => {
        const existingKey = item.variantId 
          ? `${item.id}-${item.variantId}` 
          : item.id;
        return existingKey === itemKey;
      });
      if (existing) {
        return current.map((item) => {
          const existingKey = item.variantId 
            ? `${item.id}-${item.variantId}` 
            : item.id;
          return existingKey === itemKey 
            ? { ...item, quantity: item.quantity + quantity } 
            : item;
        });
      }
      return [...current, { ...product, quantity }];
    });
  };

  const removeFromCart = (key: string) => {
    setItems((current) => {
      // key can be either just 'id' or 'id-variantId'
      return current.filter((item) => {
        const itemKey = item.variantId 
          ? `${item.id}-${item.variantId}` 
          : item.id;
        return itemKey !== key;
      });
    });
  };

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(key);
      return;
    }
    setItems((current) =>
      current.map((item) => {
        const itemKey = item.variantId 
          ? `${item.id}-${item.variantId}` 
          : item.id;
        return itemKey === key ? { ...item, quantity } : item;
      })
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };
}
