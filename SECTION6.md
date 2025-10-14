# Section 6: Revenue Features & Monetization

**Time Estimate:** 3-4 hours
**Complexity:** HIGH
**Dependencies:** Sections 1, 2 complete; Section 4 & 5 recommended
**Risk Level:** Medium (payment processing, compliance)

---

## 🎯 Objectives

Implement revenue-generating features to monetize the platform:

1. **Premium Subscriptions** - Paid membership tier
2. **Payment Processing** - Stripe integration
3. **Enhanced AdSense** - Optimize ad placement and revenue
4. **Newsletter Sponsorships** - Sponsored content in emails
5. **API Access Tier** - Paid API for businesses/researchers

---

## 💰 Revenue Streams (From HTML Roadmap)

### Target Revenue Model
1. **Google AdSense** - $6k-12k/year (primary)
2. **Newsletter Sponsors** - $2k-5k/year
3. **Premium Subscriptions** - $500-2k/year
4. **API Access** - $0-500/year (later)

### Year 1 Goal: $8k-18k
- 95% profit margin
- Low operational costs ($50-300/month)
- Scalable passive income

---

## 📋 Tasks Checklist

### Task 6.1: Stripe Payment Integration
**Time: 1-1.5 hours**

#### A. Install Stripe
```bash
npm install stripe @stripe/stripe-js
npm install -D @types/stripe
```

#### B. Set Up Stripe Account
- [ ] Create Stripe account at https://stripe.com
- [ ] Get API keys (test & live)
- [ ] Configure webhook endpoint
- [ ] Set up products and pricing

**Pricing Structure:**
```
Free Tier:
- View all articles
- Basic newsletter

Premium ($9/month or $90/year):
- Ad-free experience
- Early access to articles
- Premium newsletter (daily)
- Access to article archives
- API access (limited)
```

#### C. Create Stripe Service

Create `/lib/services/stripe.ts`:

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export class StripeService {
  // Create checkout session for subscription
  static async createCheckoutSession(priceId: string, customerEmail: string) {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.SITE_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/subscribe/cancel`,
      customer_email: customerEmail,
      metadata: {
        type: 'premium_subscription',
      },
    })

    return session
  }

  // Create customer portal session (manage subscription)
  static async createPortalSession(customerId: string) {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.SITE_URL}/account`,
    })

    return session
  }

  // Verify webhook signature
  static constructEvent(payload: string | Buffer, signature: string) {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  }

  // Get subscription status
  static async getSubscription(subscriptionId: string) {
    return await stripe.subscriptions.retrieve(subscriptionId)
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId: string) {
    return await stripe.subscriptions.cancel(subscriptionId)
  }
}
```

#### D. Create Checkout API

Create `/app/api/checkout/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { StripeService } from '@/lib/services/stripe'

export async function POST(request: NextRequest) {
  try {
    const { priceId, email } = await request.json()

    if (!priceId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const session = await StripeService.createCheckoutSession(priceId, email)

    return NextResponse.json({ sessionId: session.id, url: session.url })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
```

#### E. Create Webhook Handler

Create `/app/api/webhooks/stripe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { StripeService } from '@/lib/services/stripe'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  try {
    const event = StripeService.constructEvent(body, signature)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
}

async function handleCheckoutComplete(session: any) {
  // Create or update subscription in database
  const subscription = await prisma.subscription.create({
    data: {
      userId: session.client_reference_id,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      status: 'active',
      priceId: session.line_items.data[0].price.id,
      currentPeriodEnd: new Date(session.expires_at * 1000),
    },
  })

  // Send welcome email
  // await EmailService.sendWelcomeEmail(...)
}
```

**Files to create:**
- `lib/services/stripe.ts` (NEW)
- `app/api/checkout/route.ts` (NEW)
- `app/api/webhooks/stripe/route.ts` (NEW)
- `app/subscribe/page.tsx` (NEW - subscription page)
- `app/subscribe/success/page.tsx` (NEW)
- `app/account/page.tsx` (NEW - manage subscription)

---

### Task 6.2: Premium Features & Access Control
**Time: 45 minutes**

#### A. Update Database Schema

Add to `prisma/schema.prisma`:

```prisma
model Subscription {
  id                   String   @id @default(cuid())
  userId               String   @unique
  stripeCustomerId     String   @unique
  stripeSubscriptionId String   @unique
  status               String   // active, canceled, past_due
  priceId              String
  currentPeriodEnd     DateTime
  cancelAtPeriodEnd    Boolean  @default(false)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@map("subscriptions")
}

model User {
  id           String        @id @default(cuid())
  email        String        @unique
  name         String?
  role         String        @default("user") // user, premium, admin
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  subscription Subscription?

  @@map("users")
}
```

#### B. Create Access Control Middleware

Update `middleware.ts`:

```typescript
import { getServerSession } from 'next-auth'

export async function middleware(request: NextRequest) {
  const session = await getServerSession()

  // Check if premium feature
  if (request.nextUrl.pathname.startsWith('/premium')) {
    if (!session || session.user.role !== 'premium') {
      return NextResponse.redirect(new URL('/subscribe', request.url))
    }
  }

  // ... existing middleware
}
```

#### C. Add Premium Features
- [ ] Ad-free experience (hide ads for premium users)
- [ ] Early access articles (publish 24h early for premium)
- [ ] Extended archives (access older articles)
- [ ] Premium newsletter tier
- [ ] API access (limited calls per month)

---

### Task 6.3: Optimize AdSense Integration
**Time: 30 minutes**

#### A. Enable AdSense

Update `app/layout.tsx`:

```typescript
import { AdSenseScript } from '@/components/features/adsense'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <AdSenseScript />
      </head>
      <body>
        {/* ... */}
      </body>
    </html>
  )
}
```

#### B. Strategic Ad Placement

Create optimal ad slots:
- **Homepage**: Top banner, between article cards
- **Article pages**: Top, middle (after AI analysis), bottom
- **Sidebar**: Sticky ad unit (desktop only)

Update `/components/features/adsense.tsx`:

```typescript
'use client'

export function AdSenseUnit({ slot, format = 'auto', responsive = true }) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive}
    />
  )
}

// Hide ads for premium users
export function ConditionalAdSense({ user, ...props }) {
  if (user?.role === 'premium') return null
  return <AdSenseUnit {...props} />
}
```

---

### Task 6.4: Newsletter Sponsorships
**Time: 45 minutes**

#### A. Create Sponsor Management

Add to database:

```prisma
model NewsletterSponsor {
  id          String   @id @default(cuid())
  companyName String
  logoUrl     String?
  message     String
  linkUrl     String
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean  @default(true)
  impressions Int      @default(0)
  clicks      Int      @default(0)
  createdAt   DateTime @default(now())

  @@map("newsletter_sponsors")
}
```

#### B. Update Email Template

Update `lib/services/email.ts` to include sponsor section:

```typescript
const emailTemplate = `
<!DOCTYPE html>
<html>
<body>
  <h1>Narrative News Daily</h1>

  ${sponsorContent ? `
    <div style="background: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
      <p style="font-size: 12px; color: #6b7280; margin-bottom: 10px;">SPONSORED</p>
      <h3>${sponsorContent.companyName}</h3>
      <p>${sponsorContent.message}</p>
      <a href="${sponsorContent.linkUrl}?utm_source=newsletter" style="color: #3b82f6;">Learn More →</a>
    </div>
  ` : ''}

  <!-- Articles content -->
  ${articlesHTML}

  <p style="font-size: 12px; color: #6b7280; margin-top: 40px;">
    Want to advertise in Narrative News? <a href="${siteUrl}/advertise">Contact us</a>
  </p>
</body>
</html>
`
```

#### C. Create Sponsorship Admin Page

Create `/app/admin/sponsors/page.tsx`:
- Add/edit sponsors
- Schedule sponsorship periods
- Track impressions and clicks
- Revenue reporting

---

### Task 6.5: API Access Tier (Optional)
**Time: 1 hour**

For businesses/researchers who want programmatic access.

#### A. Create API Authentication

```typescript
// lib/utils/api-auth.ts
export async function validateAPIKey(apiKey: string) {
  const key = await prisma.apiKey.findUnique({
    where: { key: apiKey },
    include: { user: true }
  })

  if (!key || !key.isActive) {
    throw new Error('Invalid API key')
  }

  // Check usage limits
  if (key.requestsThisMonth >= key.monthlyLimit) {
    throw new Error('API rate limit exceeded')
  }

  // Increment usage
  await prisma.apiKey.update({
    where: { id: key.id },
    data: { requestsThisMonth: { increment: 1 } }
  })

  return key
}
```

#### B. Create Public API Endpoints

Create `/app/api/v1/articles/route.ts`:

```typescript
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')

  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 })
  }

  try {
    await validateAPIKey(apiKey)

    const articles = await DatabaseService.getArticles({ limit: 50 })

    return NextResponse.json({
      success: true,
      data: articles,
      meta: { version: 'v1', requestId: crypto.randomUUID() }
    })

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 }
    )
  }
}
```

#### C. API Documentation Page

Create `/app/api-docs/page.tsx`:
- API reference documentation
- Authentication guide
- Rate limits
- Example requests
- Pricing tiers

---

## 📁 Files Summary

### New Files (15-20):
1. `lib/services/stripe.ts` - Stripe integration
2. `app/api/checkout/route.ts` - Checkout API
3. `app/api/webhooks/stripe/route.ts` - Webhook handler
4. `app/subscribe/page.tsx` - Subscription page
5. `app/subscribe/success/page.tsx` - Success page
6. `app/account/page.tsx` - Account management
7. `app/admin/sponsors/page.tsx` - Sponsor management
8. `app/api/v1/articles/route.ts` - Public API
9. `app/api-docs/page.tsx` - API documentation
10. `lib/utils/api-auth.ts` - API authentication

### Modified Files (5-8):
1. `prisma/schema.prisma` - Add Subscription, User, NewsletterSponsor, APIKey models
2. `middleware.ts` - Add premium access control
3. `app/layout.tsx` - Enable AdSense
4. `components/features/adsense.tsx` - Optimize ads
5. `lib/services/email.ts` - Add sponsor content
6. `.env.example` - Add Stripe keys

---

## 📊 Success Criteria

After completing Section 6:

✅ **Payment Processing:**
- Stripe integration working
- Checkout flow complete
- Webhooks processing correctly
- Subscription management available

✅ **Premium Features:**
- Premium tier functional
- Access control working
- Ad-free experience for premium
- Premium newsletter sending

✅ **AdSense:**
- Ads displaying correctly
- Strategic placement optimized
- Revenue tracking active
- Hidden for premium users

✅ **Sponsorships:**
- Sponsor management system
- Newsletter integration
- Click/impression tracking
- Revenue reporting

✅ **API Access:**
- Public API functional
- Authentication working
- Rate limiting active
- Documentation published

---

## 🔄 After Section 6

**Your app generates revenue!**
- Multiple income streams active
- Payment processing secure
- Premium features available
- Scalable monetization model

**Next Steps:**
- Marketing and growth
- Content optimization
- SEO improvements
- Partnership development

---

## 💡 Tips

1. **Start with Stripe test mode** - Test thoroughly before going live
2. **Be transparent** - Clear pricing, no hidden fees
3. **Value proposition** - Make premium worth it
4. **Compliance** - Follow tax laws, privacy regulations
5. **Customer support** - Handle subscription issues promptly

---

## ⏱️ Time Breakdown

| Task | Estimated Time |
|------|----------------|
| 6.1 Stripe Integration | 1-1.5 hours |
| 6.2 Premium Features | 45 minutes |
| 6.3 AdSense Optimization | 30 minutes |
| 6.4 Newsletter Sponsorships | 45 minutes |
| 6.5 API Access (optional) | 1 hour |
| **Total** | **3.5-4.5 hours** |

---

## ⚠️ Important Legal/Compliance

Before launching revenue features:

- [ ] Terms of Service updated
- [ ] Privacy Policy updated (payment data)
- [ ] Refund policy established
- [ ] Tax compliance (sales tax, VAT)
- [ ] PCI DSS compliance (Stripe handles this)
- [ ] GDPR compliance (if EU users)
- [ ] Subscription cancellation clear and easy

---

**Revenue features turn your passion project into a sustainable business!**
