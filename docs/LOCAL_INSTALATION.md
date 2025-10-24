# 🚀 Local Installation Guide

This guide provides step-by-step instructions to set up and run the FactCheckerProject on your local machine for development purposes.

## 📋 Prerequisites

Before you begin, ensure you have the following software installed on your system:

- **Node.js**: Version 20.x or higher.
- **npm**: Version 10.x or higher (usually comes with Node.js).
- **Docker**: Required to run the MySQL database container. Make sure the Docker daemon is running.
- **Git**: For cloning the repository.

---

## ⚙️ Step-by-Step Installation

### 1. Clone the Repository

First, clone the project from your Git repository to your local machine.

```bash
git clone <your-repository-url>
cd FactCheckerProject
```

### 2. Install Dependencies

This is a monorepo using npm workspaces. Install all dependencies for both the server and web applications from the root directory.

```bash
npm install
```

### 3. Set Up the Database

The project uses Docker to run a MySQL database. A convenient script is provided to manage the container.

```bash
npm run db:start
```

This command will start a MySQL container in the background. You can verify it's running with `docker ps`.

### 4. Configure Environment Variables

You need to create .env files for both the server and web applications. Copy the example files and fill in the required values.

#### a) Backend Server (apps/server/.env)

Create a file named .env inside the apps/server directory by copying apps/server/.env.example.

```bash
cp apps/server/.env.example apps/server/.env
```

Your apps/server/.env file should look like this. The default values are pre-configured for the local Docker setup. You must generate a new BETTER_AUTH_SECRET.

```env
# Database Connection (Defaults are set for the Docker container)
DATABASE_URL="mysql://user:password@localhost:3306/FactCheckerProject"
DB_HOST=localhost
DB_PORT=3306
DB_USER=user
DB_PASSWORD=password
DB_NAME=FactCheckerProject

# Authentication (CRITICAL: Generate a strong, unique secret)
# You can generate one here: https://generate-secret.vercel.app/32
BETTER_AUTH_SECRET="your_super_strong_and_unique_secret_key_here"
BETTER_AUTH_URL="http://localhost:3000"

# Application URLs
CORS_ORIGIN="http://localhost:3001"
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# External API (Defaults to use the internal mock/fake API)
API_MODE=development
EXTERNAL_API_BASE_URL="http://localhost:3000/api/fakeAPI"
EXTERNAL_API_KEY="fake-api-key-for-development"

# Social Providers (Optional)
# GOOGLE_CLIENT_ID="your_google_client_id"
# GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

#### b) Frontend Web (apps/web/.env)

Create a file named .env inside the apps/web directory by copying apps/web/.env.example.

```bash
cp apps/web/.env.example apps/web/.env
```

The contents should be:

```env
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

### 5. Run Database Migrations

With the database running and the .env file configured, apply the database schema. Drizzle ORM will create all the necessary tables.

```bash
npm run db:migrate
```

You should see a confirmation that all migrations have been applied successfully.

This will clear the database and fill it with the sample data defined in seedsQuery.ts, which is very useful for testing the application features immediately.

### 6. Run the Application

You are now ready to start the development servers for both the frontend and backend. The root dev script handles this for you using Turborepo.

```bash
npm run dev
```

This will:

- Start the backend server on http://localhost:3000.
- Start the frontend web application on http://localhost:3001.

Open your browser and navigate to http://localhost:3001 to see the application running.

## 💡 Troubleshooting

- **ER_ACCESS_DENIED_ERROR on db:migrate**: Your database credentials in apps/server/.env are incorrect or the database container is not running. Stop (`npm run db:stop`) and restart (`npm run db:start`) the container and double-check your .env file.
- **Table '...' already exists on db:migrate**: The Drizzle migration history is out of sync with your database. This can happen if you used db:push previously. The safest way to resolve this is to drop the database and start over:
  1. `npm run db:down` (This will delete the database volume).
  2. `npm run db:start`
  3. `npm run db:migrate`
- **CORS Errors**: If you change the frontend port from 3001, make sure to update the CORS_ORIGIN variable in apps/server/.env to match.
- **Docker Port Conflict**: If another service is using port 3306, you can change the port mapping in apps/server/docker-compose.yml (e.g., "3307:3306") and update DB_PORT in apps/server/.env.

## 📜 Available Scripts

Here are some of the most useful commands available in the root package.json:

- `npm run dev`: Starts all applications in development mode.
- `npm run build`: Builds all applications for production.
- `npm run check`: Lints and formats the entire codebase using Biome.
- `npm run db:start`: Starts the MySQL Docker container.
- `npm run db:stop`: Stops the MySQL Docker container.
- `npm run db:down`: Stops and removes the container and its data volume (useful for a clean reset).
- `npm run db:migrate`: Applies pending database migrations.
- `npm run db:studio`: Opens Drizzle Studio to visually inspect and manage your database.
