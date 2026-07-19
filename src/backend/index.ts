import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { PRESETS, TOPPINGS } from '../frontend/types';
import { getAllOrders, getOrdersByUserId, getOrderById, createOrder, updateOrderPayment } from './db/orders.ts';
import { getOrCreateUser } from './db/users.ts';
import { getStripe } from './lib/stripe.ts';
import { requireAuth, AuthRequest } from './middleware/auth.ts';
import { adminAuth } from './lib/firebase-admin.ts';

let orderCounter = 1001;

// Helper to optionally resolve user from header for optional auth endpoints (like POST /api/orders)
async function getOptionalUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const dbUser = await getOrCreateUser(decodedToken.uid, decodedToken.email || '');
    return dbUser;
  } catch (err) {
    console.warn("Optional auth parsing failed:", err);
    return null;
  }
}

export async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON requests
  app.use(express.json());

  // API endpoints
  app.get('/api/presets', (req, res) => {
    res.json(PRESETS);
  });

  app.get('/api/toppings', (req, res) => {
    res.json(TOPPINGS);
  });

  // Get ALL orders from database (public, or we can secure it, but keep it accessible for general tracking)
  app.get('/api/orders', async (req, res) => {
    try {
      const orders = await getAllOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get specific authenticated user's orders
  app.get('/api/orders/user', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.dbId;
      if (!userId) {
        return res.status(400).json({ error: "User profile not synchronized." });
      }
      const orders = await getOrdersByUserId(userId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new order (supports guest OR logged-in users)
  app.post('/api/orders', async (req, res) => {
    try {
      const { presetId, selectedToppings, crustType, cheeseLevel, bakeStyle, size, totalPrice } = req.body;

      if (!presetId) {
        return res.status(400).json({ error: 'presetId is required' });
      }

      const dbUser = await getOptionalUser(req);

      const newDbOrder = await createOrder({
        orderNumber: `#${orderCounter++}`,
        userId: dbUser ? dbUser.id : null,
        presetId,
        selectedToppings: selectedToppings || [],
        crustType: crustType || 'neapolitan',
        cheeseLevel: cheeseLevel || 'regular',
        bakeStyle: bakeStyle || 'regular',
        size: size || 'medium',
        totalPrice: totalPrice || 15.0,
        status: 'received',
        paymentStatus: 'pending',
      });

      res.status(201).json(newDbOrder);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get a specific order
  app.get('/api/orders/:orderId', async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      if (isNaN(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID' });
      }
      const order = await getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create Stripe Checkout Session for an order
  app.post('/api/orders/:orderId/pay', async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      if (isNaN(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID' });
      }

      const order = await getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check if Stripe Key is configured
      const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;

      // Determine the base URL for redirects (APP_URL or request host)
      let baseUrl = process.env.APP_URL;
      if (!baseUrl) {
        const host = req.get('host') || 'localhost:3000';
        const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
        const protocol = isLocal ? 'http' : 'https';
        baseUrl = `${protocol}://${host}`;
      }

      if (!hasStripeKey) {
        // Return simulated sandbox checkout url
        const mockSessionId = `mock_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const mockUrl = `${baseUrl}/?sandbox_checkout=true&session_id=${mockSessionId}&order_id=${order.id}`;
        console.log(`[Stripe Sandbox Mode] Generating mock checkout URL: ${mockUrl}`);
        return res.json({ id: mockSessionId, url: mockUrl });
      }

      const stripe = getStripe();
      
      // Find preset details
      const preset = PRESETS.find(p => p.id === order.presetId);
      const name = preset ? preset.name : 'Custom Pizza';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${name} (${order.size.toUpperCase()} size)`,
                description: `Custom pizza with crust: ${order.crustType}, cheese: ${order.cheeseLevel}, bake: ${order.bakeStyle}`,
              },
              unit_amount: Math.round(order.totalPrice * 100), // in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/?payment_success=true&session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
        cancel_url: `${baseUrl}/?payment_cancel=true`,
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Stripe Checkout Session creation failed:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Verify Stripe payment success
  app.get('/api/orders/:orderId/verify-payment', async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const { session_id } = req.query;

      if (isNaN(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID' });
      }

      if (!session_id || typeof session_id !== 'string') {
        return res.status(400).json({ error: 'Stripe session_id query parameter is required' });
      }

      const order = await getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // If already marked as paid, skip query
      if (order.paymentStatus === 'paid') {
        return res.json(order);
      }

      // Handle Sandbox checkout validation
      if (session_id.startsWith('mock_session_')) {
        console.log(`[Stripe Sandbox Mode] Verifying mock checkout session: ${session_id}`);
        const updated = await updateOrderPayment(orderId, 'paid', session_id);
        return res.json(updated);
      }

      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.payment_status === 'paid') {
        const updated = await updateOrderPayment(orderId, 'paid', session_id);
        return res.json(updated);
      }

      res.json(order);
    } catch (error: any) {
      console.error("Verification of Stripe payment failed:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Serve static assets / Vite Dev Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
