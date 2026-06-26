# School Management System

A complete, production-grade School Management System built with Next.js 14+, PostgreSQL, Prisma, NextAuth.js, Tailwind CSS, and shadcn/ui.

## Tech Stack

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js (Auth.js) with credentials provider
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Validation**: Zod + react-hook-form
- **Payments**: Stripe (test mode)

## Features

- **Four roles**: Admin, Teacher, Student, Parent
- **Role-based access control**: Middleware protects all dashboard routes
- **No public signup**: Only admins can create user accounts
- **Forced password change**: New users must change password on first login
- **Fee management**: Stripe Checkout integration for payments
- **Announcements**: Targeted to specific roles or classes
- **Messaging**: Simple inbox for communication

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe test keys (optional, for payments)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd sms

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and other secrets

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npm run db:seed

# Start the development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/school_management"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
CURRENCY="USD"
RESEND_API_KEY="re_..."
```

### Test Accounts

After seeding, use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.com | admin123 |
| Teacher | teacher1@school.com | teacher123 |
| Teacher | teacher2@school.com | teacher123 |
| Student | student1@school.com | student123 |
| Student | student2@school.com | student123 |
| Parent | parent1@school.com | parent123 |
| Parent | parent2@school.com | parent123 |

### Stripe Testing

To test Stripe payments locally:

```bash
# Install Stripe CLI
npm install -g stripe

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Use test card: 4242 4242 4242 4242
```

## Project Structure

```
sms/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Seed data
│   └── migrations/        # Database migrations
├── src/
│   ├── app/
│   │   ├── (dashboard)/   # Dashboard layouts & pages
│   │   │   └── dashboard/
│   │   │       ├── admin/ # Admin dashboard
│   │   │       ├── teacher/ # Teacher dashboard
│   │   │       ├── student/ # Student dashboard
│   │   │       └── parent/ # Parent dashboard
│   │   ├── api/           # API routes
│   │   ├── login/         # Login page
│   │   └── change-password/ # Password change page
│   ├── components/        # Reusable components
│   │   ├── ui/           # shadcn/ui components
│   │   └── providers.tsx  # Session provider
│   ├── lib/              # Utilities
│   │   ├── auth.ts       # NextAuth config
│   │   ├── prisma.ts     # Prisma client
│   │   └── utils.ts      # Helper functions
│   └── types/            # TypeScript types
├── .env                  # Environment variables
└── package.json
```

## API Routes

- `/api/auth/*` - Authentication endpoints
- `/api/admin/*` - Admin-only endpoints
- `/api/teacher/*` - Teacher endpoints
- `/api/student/*` - Student endpoints
- `/api/parent/*` - Parent endpoints
- `/api/payments/*` - Stripe payment endpoints
- `/api/webhooks/*` - Webhook handlers
- `/api/announcements` - Announcements CRUD
- `/api/messages` - Messages CRUD

## License

MIT
