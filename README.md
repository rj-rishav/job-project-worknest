# WorkNest - Collaborative Workspace Management

A modern workspace management application built with Next.js, featuring role-based access control, multi-tenancy, and comprehensive task management.

## Features

- 🔐 **Authentication** - Secure authentication with NextAuth.js
- 👥 **Multi-tenancy** - Workspace isolation with role-based access control
- ✅ **Task Management** - Create, assign, and track tasks
- 📊 **Dashboard** - Real-time insights and activity tracking
- 🎯 **Activity Logging** - Comprehensive audit trail
- 🧪 **Comprehensive Testing** - 85+ automated tests covering critical business logic

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI**: React, TailwindCSS, shadcn/ui
- **Testing**: Vitest
- **Type Safety**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd worknest
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:

   ```env
   # Database - Update with your PostgreSQL credentials
   DATABASE_URL="postgresql://user:password@localhost:5432/worknest"

   # NextAuth - Generate a secret with: openssl rand -base64 32
   NEXTAUTH_SECRET="your-generated-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**

   ```bash
   # Push the schema to your database
   npx prisma db push

   # (Optional) Seed the database with sample data
   npx prisma db seed
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Testing

The project includes a comprehensive test suite covering:

- RBAC enforcement (28 tests)
- Multi-tenancy/workspace isolation (8 tests)
- Input validation (21 tests)
- Activity logging (12 tests)
- Error handling (16 tests)

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Open test UI
npm run test:ui
```

### Test Setup

For testing, create a `.env.test` file:

```bash
cp .env.test.example .env.test
```

Update with your test database credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/worknest_test"
NEXTAUTH_SECRET="test-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

See [TEST_IMPLEMENTATION.md](./TEST_IMPLEMENTATION.md) for detailed testing documentation.

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   └── workspace/         # Workspace pages
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── layout/           # Layout components
│   └── ui/               # UI components (shadcn/ui)
├── lib/                   # Utility libraries
│   ├── auth/             # Authentication logic
│   ├── db/               # Database client
│   ├── services/         # Business logic services
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   └── validators/       # Input validation schemas
├── prisma/               # Database schema and migrations
└── tests/                # Test suites
```

## Database Schema

The application uses the following main entities:

- **User** - Application users
- **Workspace** - Isolated workspaces for teams
- **Membership** - User-workspace relationships with roles
- **Task** - Tasks within workspaces
- **ActivityLog** - Audit trail of actions

## Role-Based Access Control

The application supports four roles:

- **OWNER** - Full access, can delete workspace
- **ADMIN** - Can manage members and all tasks
- **MEMBER** - Can create and manage own tasks
- **VIEWER** - Read-only access

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Vitest Documentation](https://vitest.dev)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
