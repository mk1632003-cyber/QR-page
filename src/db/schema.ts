import { relations } from 'drizzle-orm';
import { integer, pgTable, real, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define the 'users' table.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'orders' table.
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull(),
  userId: integer('user_id').references(() => users.id),
  presetId: text('preset_id').notNull(),
  selectedToppings: text('selected_toppings').notNull(), // JSON string representing array of toppings
  crustType: text('crust_type').notNull(),
  cheeseLevel: text('cheese_level').notNull(),
  bakeStyle: text('bake_style').notNull(),
  size: text('size').notNull(),
  totalPrice: real('total_price').notNull(),
  status: text('status').notNull().default('received'), // 'received', 'prepped', 'baking', 'done'
  paymentStatus: text('payment_status').notNull().default('pending'), // 'pending', 'paid', 'failed'
  stripeSessionId: text('stripe_session_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));
