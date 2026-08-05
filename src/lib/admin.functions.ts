import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error("Unauthorized: Admin access required");
    }

    const [
      { count: totalProducts },
      { count: activeOrders },
      { data: salesData }
    ] = await Promise.all([
      supabase.from("products").select("*", { count: 'exact', head: true }),
      supabase.from("orders").select("*", { count: 'exact', head: true }).neq("status", "completed").neq("status", "cancelled"),
      supabase.from("orders").select("total_amount").eq("status", "completed")
    ]);

    const totalSales = salesData?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;

    return {
      totalProducts: totalProducts || 0,
      activeOrders: activeOrders || 0,
      totalSales
    };
  });

export const getAdminProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
    if (profile?.role !== 'admin') throw new Error("Unauthorized");

    const { data: products, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return products;
  });

export const updateAdminProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid(),
    is_active: z.boolean().optional(),
    stock_quantity: z.number().int().min(0).optional(),
    price: z.number().min(0).optional(),
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
    if (profile?.role !== 'admin') throw new Error("Unauthorized");

    const { id, ...updates } = data;
    const { error } = await supabase.from("products").update({
      is_active: updates.is_active ?? undefined,
      stock_quantity: updates.stock_quantity ?? undefined,
      price: updates.price ?? undefined,
    }).eq("id", id);
    if (error) throw error;
    return { success: true };
  });

export const getAdminOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
    if (profile?.role !== 'admin') throw new Error("Unauthorized");

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, profiles(full_name, email), order_items(*, products(name))")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return orders;
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    orderId: z.string().uuid(),
    status: z.enum(['pending', 'processing', 'completed', 'cancelled']),
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
    if (profile?.role !== 'admin') throw new Error("Unauthorized");

    const { error } = await supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.orderId);

    if (error) throw error;
    return { success: true };
  });
