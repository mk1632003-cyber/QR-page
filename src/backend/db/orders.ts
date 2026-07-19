import { db } from '../../db/index.ts';
import { orders, users } from '../../db/schema.ts';
import { eq, desc } from 'drizzle-orm';

export interface CreateOrderInput {
  orderNumber: string;
  userId?: number | null;
  presetId: string;
  selectedToppings: string[];
  crustType: string;
  cheeseLevel: string;
  bakeStyle: string;
  size: string;
  totalPrice: number;
  status?: string;
  paymentStatus?: string;
}

// 1. Get all orders (latest first)
export async function getAllOrders() {
  try {
    const result = await db.select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
    return result;
  } catch (error) {
    console.error("Database query (getAllOrders) failed:", error);
    throw new Error("Failed to load orders from database.", { cause: error });
  }
}

// 2. Get orders by user ID
export async function getOrdersByUserId(userId: number) {
  try {
    const result = await db.select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
    return result;
  } catch (error) {
    console.error("Database query (getOrdersByUserId) failed:", error);
    throw new Error("Failed to load your orders from database.", { cause: error });
  }
}

// 3. Get order by database ID
export async function getOrderById(orderId: number) {
  try {
    const result = await db.select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error(`Database query (getOrderById: ${orderId}) failed:`, error);
    throw new Error("Failed to load order detail from database.", { cause: error });
  }
}

// 4. Create a new order
export async function createOrder(input: CreateOrderInput) {
  try {
    const result = await db.insert(orders)
      .values({
        orderNumber: input.orderNumber,
        userId: input.userId || null,
        presetId: input.presetId,
        selectedToppings: JSON.stringify(input.selectedToppings),
        crustType: input.crustType,
        cheeseLevel: input.cheeseLevel,
        bakeStyle: input.bakeStyle,
        size: input.size,
        totalPrice: input.totalPrice,
        status: input.status || 'received',
        paymentStatus: input.paymentStatus || 'pending',
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database query (createOrder) failed:", error);
    throw new Error("Failed to save your order to the database.", { cause: error });
  }
}

// 5. Update order payment status
export async function updateOrderPayment(orderId: number, paymentStatus: 'pending' | 'paid' | 'failed', stripeSessionId?: string) {
  try {
    const result = await db.update(orders)
      .set({
        paymentStatus,
        ...(stripeSessionId ? { stripeSessionId } : {}),
        ...(paymentStatus === 'paid' ? { status: 'prepped' } : {}) // Auto-advance state once paid!
      })
      .where(eq(orders.id, orderId))
      .returning();
    return result[0];
  } catch (error) {
    console.error(`Database query (updateOrderPayment: ${orderId}) failed:`, error);
    throw new Error("Failed to update order payment status in database.", { cause: error });
  }
}
