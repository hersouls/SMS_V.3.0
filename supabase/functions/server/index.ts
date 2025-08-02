import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from './kv_store.ts';

// Deno 환경 타입 선언
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const app = new Hono();

// CORS and logging middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));

app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Helper function to verify user authentication
async function verifyUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return null;
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return null;
  }
  
  return user;
}

// User signup
app.post('/make-server-7a0e61a7/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Initialize user settings
    await kv.set(`user_settings:${data.user.id}`, {
      exchangeRate: 1300,
      notifications: {
        paymentReminders: true,
        priceChanges: false,
        subscriptionExpiry: true
      }
    });

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get user subscriptions
app.get('/make-server-7a0e61a7/subscriptions', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const subscriptions = await kv.getByPrefix(`subscription:${user.id}:`);
    return c.json({ subscriptions: subscriptions || [] });
  } catch (error) {
    console.log(`Get subscriptions error: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create subscription
app.post('/make-server-7a0e61a7/subscriptions', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const subscriptionData = await c.req.json();
    const subscriptionId = crypto.randomUUID();
    
    const subscription = {
      id: subscriptionId,
      userId: user.id,
      ...subscriptionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`subscription:${user.id}:${subscriptionId}`, subscription);
    return c.json({ subscription });
  } catch (error) {
    console.log(`Create subscription error: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update subscription
app.put('/make-server-7a0e61a7/subscriptions/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const subscriptionId = c.req.param('id');
    const updates = await c.req.json();
    
    const existingSubscription = await kv.get(`subscription:${user.id}:${subscriptionId}`);
    if (!existingSubscription) {
      return c.json({ error: 'Subscription not found' }, 404);
    }

    const updatedSubscription = {
      ...existingSubscription,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`subscription:${user.id}:${subscriptionId}`, updatedSubscription);
    return c.json({ subscription: updatedSubscription });
  } catch (error) {
    console.log(`Update subscription error: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete subscription
app.delete('/make-server-7a0e61a7/subscriptions/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const subscriptionId = c.req.param('id');
    await kv.del(`subscription:${user.id}:${subscriptionId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Delete subscription error: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get user settings
app.get('/make-server-7a0e61a7/settings', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const settings = await kv.get(`user_settings:${user.id}`);
    return c.json({ settings: settings || {} });
  } catch (error) {
    console.log(`Get settings error: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update user settings
app.put('/make-server-7a0e61a7/settings', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const updates = await c.req.json();
    const existingSettings = await kv.get(`user_settings:${user.id}`) || {};
    
    const updatedSettings = {
      ...existingSettings,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user_settings:${user.id}`, updatedSettings);
    return c.json({ settings: updatedSettings });
  } catch (error) {
    console.log(`Update settings error: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Health check
app.get('/make-server-7a0e61a7/health', (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() });
});

serve(app.fetch); 