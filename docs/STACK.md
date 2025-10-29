# 🛠️ Technology Stack

This document outlines the technologies, frameworks, and libraries used in the CheckeApp.

---

## 🎯 Core Technologies

| Category        | Technology | Version | Description                                 |
| --------------- | ---------- | ------- | ------------------------------------------- |
| ⚡ **Runtime**  | Node.js    | 20+     | JavaScript runtime environment              |
| 📘 **Language** | TypeScript | 5+      | Superset of JavaScript with static typing   |
| 🗄️ **Database** | MySQL      | latest  | Relational database management system       |
| 📦 **Monorepo** | Turborepo  | 2.5.4   | High-performance build system for monorepos |

---

## 🔧 Backend (`apps/server`)

| Category                                                                       | Technology                   | Version | Description                                          |
| ------------------------------------------------------------------------------ | ---------------------------- | ------- | ---------------------------------------------------- |
| <img src="./next-js.png" width="20" height="20" alt="Next-js" /> **Framework** | Next.js                      | 15.5.0  | React framework for building full-stack applications |
| 🔌 **API**                                                                     | oRPC                         | 1.8.4   | End-to-end type-safe APIs with OpenAPI integration   |
| <img src="./drizzle-orm.png" width="20" height="20" alt="Drizzle" /> **ORM**   | Drizzle                      | 0.44.2  | TypeScript-first Object Relational Mapper            |
| 🔐 **Authentication**                                                          | Better Auth                  | 1.3.7   | Authentication library for Next.js                   |
| 🕷️ **Web Scraping**                                                            | @extractus/article-extractor | 8.0.20  | Extracts article content from a URL                  |

---

## 🎨 Frontend (`apps/web`)

| Category                                                                           | Technology                       | Version       | Description                                                |
| ---------------------------------------------------------------------------------- | -------------------------------- | ------------- | ---------------------------------------------------------- |
| <img src="./react.png" width="20" height="20" alt="Next-js" /> **Framework**       | React                            | 19.1.0        | Java Script framework                                      |
| <img src="./tailwind-css.png" width="20" height="20" alt="Tailwind" /> **Styling** | Tailwind CSS                     | 4.1.10        | Utility-first CSS framework                                |
| 🧩 **UI Components**                                                               | shadcn/ui                        | latest        | Re-usable components built with Radix UI and Tailwind CSS  |
| 🔄 **State Management**                                                            | TanStack Query                   | 5.85.5        | Data-fetching and state management library                 |
| 🌍 **Internationalization**                                                        | react-intl                       | 7.1.11        | Library for internationalization in React                  |
| 🖱️ **Drag and Drop**                                                               | @dnd-kit/core, @dnd-kit/sortable | 6.3.1, 10.0.0 | Libraries for building accessible drag and drop interfaces |

---

## 🔨 Development Tools

| Category                                                                                     | Tool        | Version | Description                                |
| -------------------------------------------------------------------------------------------- | ----------- | ------- | ------------------------------------------ |
| <img src="./biome.png" width="20" height="20" alt="Biome" />**Linter**                       | Biome       | 2.2.0   | Fast formatter and linter for web projects |
| <img src="./npm.png" width="20" height="20" alt="Npm" /> **Package Manager**                 | npm         | 11.5.2  | Node package manager                       |
| <img src="./drizzle-orm.png" width="20" height="20" alt="Drizzle" /> **Database Migrations** | drizzle-kit | 0.31.2  | CLI tool for Drizzle ORM                   |
| <img src="./docker.png" width="20" height="20" alt="Docker" /> **Containerization**          | docker      | 28.3.2  | Docker                                     |

---
