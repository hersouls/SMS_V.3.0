// @ts-ignore
// @deno-types="npm:@types/node"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { Hono } from "hono";
// @ts-ignore
import { cors } from "hono/cors";
// @ts-ignore
import { logger } from "hono/logger";
// @ts-ignore
import { createClient } from "@supabase/supabase-js";

// Deno 환경 타입 선언
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const app = new Hono();

// 허용된 도메인 목록
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:4173',
  'http://localhost:8080',
  'https://sub.moonwave.kr',
  'https://www.sub.moonwave.kr',
  'https://moonwave.kr',
  'https://www.moonwave.kr'
];

// CORS and logging middleware
app.use('*', cors({
  origin: (origin) => {
    // 개발 환경에서는 모든 origin 허용
    if (Deno.env.get('ENVIRONMENT') === 'development') {
      return origin;
    }
    
    // 프로덕션에서는 허용된 도메인만 허용
    return allowedOrigins.includes(origin) ? origin : false;
  },
  allowHeaders: ['*'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  maxAge: 86400, // 24시간
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

    // 사용자 설정은 트리거에서 자동 생성됨
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

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.log(`Get subscriptions error: ${error.message}`);
      return c.json({ error: 'Database error' }, 500);
    }

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
    
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        service_name: subscriptionData.serviceName,
        service_url: subscriptionData.serviceUrl,
        logo: subscriptionData.logo,
        logo_image: subscriptionData.logoImage,
        amount: subscriptionData.amount,
        currency: subscriptionData.currency,
        payment_cycle: subscriptionData.paymentCycle,
        payment_day: subscriptionData.paymentDay,
        payment_method: subscriptionData.paymentMethod,
        start_date: subscriptionData.startDate,
        auto_renewal: subscriptionData.autoRenewal,
        status: subscriptionData.status,
        category: subscriptionData.category,
        tier: subscriptionData.tier,
        memo: subscriptionData.memo,
        notifications: subscriptionData.notifications
      })
      .select()
      .single();

    if (error) {
      console.log(`Create subscription error: ${error.message}`);
      return c.json({ error: 'Database error' }, 500);
    }

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
    
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({
        service_name: updates.serviceName,
        service_url: updates.serviceUrl,
        logo: updates.logo,
        logo_image: updates.logoImage,
        amount: updates.amount,
        currency: updates.currency,
        payment_cycle: updates.paymentCycle,
        payment_day: updates.paymentDay,
        payment_method: updates.paymentMethod,
        start_date: updates.startDate,
        auto_renewal: updates.autoRenewal,
        status: updates.status,
        category: updates.category,
        tier: updates.tier,
        memo: updates.memo,
        notifications: updates.notifications
      })
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.log(`Update subscription error: ${error.message}`);
      return c.json({ error: 'Database error' }, 500);
    }

    if (!subscription) {
      return c.json({ error: 'Subscription not found' }, 404);
    }

    return c.json({ subscription });
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
    
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', subscriptionId)
      .eq('user_id', user.id);

    if (error) {
      console.log(`Delete subscription error: ${error.message}`);
      return c.json({ error: 'Database error' }, 500);
    }
    
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

    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.log(`Get settings error: ${error.message}`);
      return c.json({ error: 'Database error' }, 500);
    }

    // 기본 설정 반환
    const settings = preferences ? {
      exchangeRate: preferences.exchange_rate,
      notifications: preferences.notifications
    } : {
      exchangeRate: 1300,
      notifications: {
        paymentReminders: true,
        priceChanges: false,
        subscriptionExpiry: true
      }
    };

    return c.json({ settings });
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
    
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        exchange_rate: updates.exchangeRate,
        notifications: updates.notifications
      })
      .select()
      .single();

    if (error) {
      console.log(`Update settings error: ${error.message}`);
      return c.json({ error: 'Database error' }, 500);
    }

    const settings = {
      exchangeRate: preferences.exchange_rate,
      notifications: preferences.notifications
    };

    return c.json({ settings });
  } catch (error) {
    console.log(`Update settings error: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// =====================================================
// 새로운 API 엔드포인트들
// =====================================================

// Get notifications
app.get('/make-server-7a0e61a7/notifications', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.log(`Get notifications error: ${error.message}`);
      return c.json({ error: 'Database error' }, 500);
    }

    return c.json({ notifications: notifications || [] });
  } catch (error) {
    console.log(`Get notifications error: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create notification
app.post('/make-server-7a0e61a7/notifications', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const notificationData = await c.req.json();
    
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        priority: notificationData.priority,
        subscription_id: notificationData.subscriptionId,
        category: notificationData.category,
        metadata: notificationData.metadata
      })
      .select()
      .single();

    if (error) {
      console.log(`Create notification error: ${error.message}`);
      return c.json({ error: 'Database error' }, 500);
    }

    return c.json({ notification });
  } catch (error) {
    console.log(`Create notification error: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Mark notification as read
app.put('/make-server-7a0e61a7/notifications/:id/read', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const notificationId = c.req.param('id');
    
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.log(`Mark notification as read error: ${error.message}`);
      return c.json({ error: 'Database error' }, 500);
    }

    return c.json({ notification });
  } catch (error) {
    console.log(`Mark notification as read error: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get categories
app.get('/make-server-7a0e61a7/categories', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: categories, error } = await supabase
      .from('subscription_categories')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('name');

    if (error) {
      console.log(`Get categories error: ${error.message}`);
      return c.json({ error: 'Database error' }, 500);
    }

    return c.json({ categories: categories || [] });
  } catch (error) {
    console.log(`Get categories error: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get tags
app.get('/make-server-7a0e61a7/tags', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: tags, error } = await supabase
      .from('subscription_tags')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (error) {
      console.log(`Get tags error: ${error.message}`);
      return c.json({ error: 'Database error' }, 500);
    }

    return c.json({ tags: tags || [] });
  } catch (error) {
    console.log(`Get tags error: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get analytics
app.get('/make-server-7a0e61a7/analytics', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');

    let query = supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', user.id);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: analytics, error } = await query.order('date', { ascending: false });

    if (error) {
      console.log(`Get analytics error: ${error.message}`);
      return c.json({ error: 'Database error' }, 500);
    }

    return c.json({ analytics: analytics || [] });
  } catch (error) {
    console.log(`Get analytics error: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Health check
app.get('/make-server-7a0e61a7/health', (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() });
});

serve(app.fetch); 