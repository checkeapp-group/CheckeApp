# 🚀 Getting Started Guide

This guide will help you install, configure, and run the CheckeApp locally for development purposes.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

| Requirement | Version | Download/Installation                                                                    |
| ----------- | ------- | ---------------------------------------------------------------------------------------- |
| **Node.js** | 20+     | [nodejs.org](https://nodejs.org/)                                                        |
| **npm**     | 11.5.2+ | Comes with Node.js                                                                       |
| **MySQL**   | latest  | [MySQL Installation Guide](https://dev.mysql.com/doc/mysql-installation-excerpt/8.0/en/) |
| **Git**     | latest  | [git-scm.com](https://git-scm.com/)                                                      |

### Verify Installation

```bash
node --version    # Should show v20.x.x or higher
npm --version     # Should show 11.5.2 or higher
mysql --version   # Should show MySQL version
git --version     # Should show Git version
```

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/CheckeApp.git
cd CheckeApp
```

### 2. Install Dependencies

The project uses npm workspaces and Turborepo for monorepo management:

```bash
npm install
```

This will install all dependencies for:

- Root workspace
- `apps/web` (Frontend)
- `apps/server` (Backend)
- `packages/*` (Shared packages)

---

## 🔧 Configuration

### 1. Database Setup

Create a MySQL database for the project:

```bash
# Connect to MySQL
mysql -u root -p

# Create the database
CREATE DATABASE checkeapp;

# Verify creation
SHOW DATABASES;

# Exit MySQL
EXIT;
```

### 2. Environment Variables

Copy the example environment file and configure it with your settings:

```bash
cp apps/server/.env.example apps/server/.env
```

Now, edit `apps/server/.env` with your configuration:

```env
# ===================================
# DATABASE CONFIGURATION
# ===================================
DATABASE_URL=mysql://your_user:your_password@localhost:3306/checkeapp
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=checkeapp
DB_CONNECTION_LIMIT=10

# ===================================
# AUTHENTICATION & SECURITY
# ===================================
# Generate these using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
BETTER_AUTH_SECRET=your_random_secret_key_here
BETTER_AUTH_URL=http://localhost:3000
AUTH_SECRET=your_auth_secret_here
AUTH_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# ===================================
# APPLICATION URLS
# ===================================
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3001

# ===================================
# SERVER CONFIGURATION
# ===================================
RPC_PORT=5000
API_MODE=production

# ===================================
# EXTERNAL AI API (REQUIRED)
# ===================================
# This is the external API developed by Iker for AI-powered fact-checking
# See docs/API.md for complete API documentation
EXTERNAL_API_BASE_URL=https://your-ai-api-url.com
EXTERNAL_API_KEY=your_api_key_here
EXTERNAL_API_TIMEOUT=30000
MAX_RETRIES=3
RETRY_DELAY=1000

# ===================================
# OAUTH PROVIDERS (OPTIONAL)
# ===================================
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Generating Secure Secrets

For `BETTER_AUTH_SECRET`, `AUTH_SECRET`, `JWT_SECRET`, and `SESSION_SECRET`, generate secure random strings:

```bash
# Generate a secure random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this command 4 times to generate unique secrets for each variable.

#### External API Configuration

The External API is **required** for fact-checking operations. This API is developed by Iker and provides AI-powered functionality for:

- Generating critical questions from text
- Searching for relevant sources
- Generating fact-checking articles
- Creating summary images

**To obtain API credentials:**

- Contact the project administrator or refer to the external API documentation
- See [API.md](./API.md) for complete API reference and integration details

#### OAuth Configuration (Optional)

If you want to enable Google OAuth login:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

---

## 🗄️ Database Migration

After configuring your database connection, push the schema to your MySQL database:

```bash
npm run db:push
```

This will:

- Create all necessary tables
- Apply indexes and constraints
- Set up the initial schema

### Database Management Commands

```bash
npm run db:studio      # Open Drizzle Studio (Visual database browser)
npm run db:generate    # Generate migration files
npm run db:migrate     # Run pending migrations
npm run db:push        # Push schema changes directly (development)
```

---

## 🚀 Running the Application

### Development Mode

Start all applications in development mode:

```bash
npm run dev
```

This will start:

- **Frontend (Web)**: http://localhost:3001
- **Backend (Server)**: http://localhost:3000
- **API (oRPC)**: http://localhost:3000/rpc/\*

### Running Individual Applications

```bash
npm run dev:web        # Start only the frontend
npm run dev:server     # Start only the backend
```

### Production Build

```bash
npm run build          # Build all apps for production
```

---

## 🧪 Verification & Testing

### Type Checking

```bash
npm run check-types    # Check TypeScript types across all apps
```

### Code Quality

```bash
npm run check          # Run Biome linter and formatter
```

---

## 📁 Project Structure

```
CheckeApp/
├── apps/
│   ├── server/          # Backend (Next.js + oRPC)
│   │   ├── src/
│   │   │   ├── routers/     # oRPC API routes
│   │   │   ├── db/          # Database schema & services
│   │   │   │   ├── schema/  # Drizzle ORM schemas
│   │   │   │   └── services/ # Business logic
│   │   │   └── lib/         # External API client & utilities
│   │   └── .env         # Environment variables (create this)
│   │
│   └── web/             # Frontend (Next.js + React)
│       └── src/
│           ├── app/         # Next.js app router
│           ├── components/  # React components
│           └── utils/       # oRPC client & utilities
│
├── packages/            # Shared packages
├── docs/                # Documentation
├── package.json         # Root package.json (workspaces)
└── turbo.json          # Turborepo configuration
```

---

## 🔍 Available NPM Scripts

### Development

| Script               | Description                        |
| -------------------- | ---------------------------------- |
| `npm run dev`        | Start all apps in development mode |
| `npm run dev:web`    | Start only the web app             |
| `npm run dev:server` | Start only the server              |

### Build & Quality

| Script                | Description                      |
| --------------------- | -------------------------------- |
| `npm run build`       | Build all apps for production    |
| `npm run check`       | Run linter and formatter (Biome) |
| `npm run check-types` | Type-check all TypeScript code   |

### Database

| Script                | Description                            |
| --------------------- | -------------------------------------- |
| `npm run db:push`     | Push schema changes to database        |
| `npm run db:studio`   | Open Drizzle Studio (database GUI)     |
| `npm run db:generate` | Generate migration files               |
| `npm run db:migrate`  | Run pending migrations                 |
| `npm run db:start`    | Start local database (if using Docker) |
| `npm run db:stop`     | Stop local database                    |

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error:** `Access denied for user 'xxx'@'localhost'`

**Solution:**

- Verify MySQL is running: `sudo systemctl status mysql` (Linux) or check MySQL service (Windows)
- Check database credentials in `.env`
- Ensure the database exists: `mysql -u root -p -e "SHOW DATABASES;"`

#### 2. Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**

```bash
# Find process using port 3000
lsof -i :3000          # macOS/Linux
netstat -ano | findstr :3000   # Windows

# Kill the process or use different ports in .env
```

#### 3. Module Not Found

**Error:** `Cannot find module 'xxx'`

**Solution:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. External API Connection Failed

**Error:** `External API request failed`

**Solution:**

- Verify `EXTERNAL_API_BASE_URL` is correct in `.env`
- Check `EXTERNAL_API_KEY` is valid
- Ensure you have network access to the external API
- Review [API.md](./API.md) for API configuration details

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use strong, unique secrets** - Generate them using crypto.randomBytes()
3. **Keep dependencies updated** - Run `npm audit` regularly
4. **Use HTTPS in production** - Never use HTTP for production deployments
5. **Rotate API keys periodically** - Especially for external services

---

## 📚 Next Steps

Now that you have the application running:

1. **Explore the codebase**: Start with [STACK.md](./STACK.md) to understand the technology stack
2. **Review the API**: Read [API.md](./API.md) for complete API documentation
3. **Understand the database**: Check [DATABASE.md](./DATABASE.md) for schema details
4. **Learn the architecture**: See [SERVER.md](./SERVER.md) and [WEB.md](./WEB.md)
5. **Study the workflow**: Review [VERIFICATION.md](./VERIFICATION.md) for the fact-checking process

---

## 💬 Getting Help

If you encounter issues not covered in this guide:

1. Check the [API Documentation](./API.md)
2. Review the [Database Schema](./DATABASE.md)
3. Search for existing issues in the GitHub repository
4. Contact the development team

---

## 🤝 Contributing

We welcome contributions! Before contributing:

1. Read this Getting Started guide thoroughly
2. Set up your development environment
3. Follow the code style (enforced by Biome)
4. Write tests for new features
5. Submit pull requests with clear descriptions

---

**Happy coding!** 🎉
