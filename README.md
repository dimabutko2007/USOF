# USOF — Full-Stack Developer Q&A Platform

![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Redux%20Toolkit%20%7C%20Node.js%20%7C%20Express%20%7C%20MySQL-blue)
![Architecture](https://img.shields.io/badge/Architecture-SPA%20%2B%20REST%20API%20%7C%20MVC%20%7C%20SOLID-purple)
![Design](https://img.shields.io/badge/Design-Modern%20Developer%20Dark%20%2F%20Light%20Aesthetic-darkgreen)
![Status](https://img.shields.io/badge/Build-Passing-brightgreen)

---

## 1. Project Overview

**USOF** (User Stack Overflow) is a full-featured, modern question-and-answer platform built for the software developer community. Inspired by Stack Overflow and engineered according to contemporary industry standards, USOF provides a seamless space for asking technical questions, sharing programming solutions, engaging in threaded discussions, and building reputation.

The platform consists of two decoupled components:
1. **`web/` (Frontend)**: A responsive Single Page Application (SPA) powered by **React**, **Redux Toolkit** for predictable state management, **React Router**, and a clean, lightweight CSS design system supporting native **Dark / Light Theme** switching. It features rich threaded discussions, comprehensive sorting and filtering, draft management, interactive reactions, and intuitive media attachments.
2. **`api/` (Backend)**: A robust RESTful API built on **Node.js / Express**, structured using **MVC**, **SOLID principles**, and the **Repository Pattern**. It interfaces with a normalized relational database (**MySQL 8.0**, 3NF), manages server-side sessions stored in MySQL, and provides secure role-based access control (RBAC).

---

## 2. Repository Structure

The codebase is organized into clear domain boundaries:

```
USOF/
├── api/                           # Backend REST API (Node.js, Express, MySQL)
│   ├── config/                    # Database connection pool (mysql2) and mailer configuration
│   ├── controllers/               # Request handling controllers (Auth, Posts, Comments, Users, etc.)
│   ├── db/                        # Schema initialization (init.js) and data seeders (seeders.js)
│   ├── middlewares/               # Authentication, RBAC, error handling, and Multer file upload
│   ├── repositories/              # Direct database abstraction layer (parameterized SQL queries)
│   ├── routes/                    # Express REST route declarations
│   ├── services/                  # Business logic services
│   ├── uploads/                   # Uploaded static assets (avatars and post attachments)
│   ├── app.js                     # Express app setup, CORS, and session management
│   ├── package.json               # Backend dependencies and scripts
│   └── test_api.js                # Automated end-to-end API test verification suite
│
├── web/                           # Frontend Client (React 18 SPA + Redux Toolkit)
│   ├── public/                    # Static assets (logo.png, default avatar)
│   ├── src/
│   │   ├── api/                   # API client layer (Axios instances with interceptors)
│   │   ├── components/
│   │   │   ├── comments/          # Threaded comment hierarchy (CommentItem, CommentTree)
│   │   │   ├── common/            # Shared UI components (Avatar, etc.)
│   │   │   ├── layout/            # Header, Sidebar, Footer, MainLayout
│   │   │   └── posts/             # PostCard, CreatePostModal, PostFilterToolbar
│   │   ├── context/               # ThemeContext (Dark/Light mode toggler)
│   │   ├── pages/                 # Full-page views:
│   │   │                          # HomePage, PostDetailsPage, ProfilePage, CategoriesPage,
│   │   │                          # FavoritesPage, SubscriptionsPage, StatsPage,
│   │   │                          # GuidelinesPage, PrivacyPage, StatusPage, NotFoundPage,
│   │   │                          # LoginPage, RegisterPage, PasswordResetPage
│   │   ├── store/                 # Redux Toolkit store (auth, posts, comments, notifications, etc.)
│   │   ├── styles/                # Pure CSS stylesheets (theme.css, global.css, layout.css)
│   │   ├── App.jsx                # Client-side router configuration
│   │   └── main.jsx               # Application entry point
│   ├── index.html
│   ├── package.json               # Frontend dependencies and Vite build scripts
│   └── vite.config.js             # Dev server proxy configuration (/api and /uploads)
│
├── package.json                   # Root manifest for concurrent workspace execution
└── README.md                      # Comprehensive project documentation
```

---

## 3. How to Run Locally

### Prerequisites
- **Node.js**: `v18.0.0` or newer (recommended `v20.x` or `v22.x LTS`).
- **npm**: `v9.x` or higher.
- **MySQL Server**: `v8.0` running locally on port `3306`.

---

### Step 1. Clone the Repository
```bash
git clone <repository_url>
cd USOF
```

---

### Step 2. Install Dependencies
Install the required packages across the root, backend, and frontend:
```bash
# Install root orchestration tools
npm install

# Install backend dependencies
cd api && npm install && cd ..

# Install frontend dependencies
cd web && npm install && cd ..
```

---

### Step 3. Configure Environment Variables
Create a `.env` file in the `api/` directory (you can copy the provided example):
```bash
cp api/.env.example api/.env
```

Configure your local MySQL credentials in `api/.env`:
```env
PORT=3000
SESSION_SECRET=usof_super_secret_key_2026

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=usof_db
```

---

### Step 4. Initialize and Seed the Database
Execute the initialization and seeding scripts to generate normalized tables and populate rich mock data ($\ge 5$ records per table across all 11 tables):
```bash
# Create all MySQL tables, indexes, and foreign keys
npm run db:init

# Seed database with sample users, categories, questions, comments, likes, subscriptions, etc.
npm run db:seed
```

---

### Step 5. Run the Project
Start both the backend API server and the frontend client concurrently with a single command from the root directory:
```bash
npm run dev
```

Once running:
- 🌐 **Frontend (Web App)**: [http://localhost:5173](http://localhost:5173)
- ⚙️ **Backend (REST API)**: [http://localhost:3000](http://localhost:3000)
- 🩺 **Health Check Endpoint**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

### Step 6. Automated Testing (API Verification)
Run the automated end-to-end API test suite to verify route integrity, validation, and database operations:
```bash
npm run test:api
```

---

## 4. Challenge-Based Learning (CBL) Breakdown

### 4.1 Engage
- **Core Challenge**: Developers require a fast, distraction-free environment to ask questions, solve complex bugs, and share knowledge without obsolete UI clutter or bloated third-party styling frameworks.
- **Goal**: Architect an end-to-end, high-performance SPA + REST API solution with enterprise-grade security, threaded conversations, strict privacy controls, and a bespoke developer aesthetic.

### 4.2 Investigate
- **Technology Evaluation**: Selected React combined with Redux Toolkit for predictable data flow, alongside native CSS variables for instant theme switching without runtime overhead.
- **Architectural Paradigm**:
  - Clear separation between the client presentation layer (`web/`) and the API domain layer (`api/`).
  - Session authentication backed by `express-mysql-session` and HTTP-only cookies, secured with CORS and transparent Vite dev proxies.
  - Recursive tree assembly for unlimited depth of threaded discussions (`parent_id`).
  - Cascading relational integrity with automated fallback migrations upon entity removal.

### 4.3 Act: Core & Required Features
1. **Global Header & Navigation**:
   - Platform brand identity featuring the official `logo.png`.
   - Real-time question search by title and content.
   - User profile badge with avatar and role indicators (`Admin`, `User`, `Guest`).
   - One-click logout available across all views.
2. **Sidebar & Menu Navigation**:
   - Quick navigation between Questions Feed, Topic Categories, Favorites, Subscriptions, and Analytics.
   - Dedicated "Ask Question" modal launcher.
3. **Questions Feed (Home Page)**:
   - Rich previews containing titles, authors, avatars, timestamps, category tags, net vote scores, and answer counters.
   - Dual-mode sorting: **Highest / Lowest Rating** and **Recently Added / Oldest** (defaulting to Recently Added).
   - Filter toolbar with multi-category selection, date range pickers, and status filters.
   - Server-side pagination with page selectors and total item counts.
4. **Question Details & Threaded Discussions**:
   - Comprehensive view of questions with Markdown support and multi-image galleries (`post_images`).
   - **Threaded Comment Tree**: Hierarchical replies with visual indentation lines.
   - **Default Comment Sorting**: Comments ordered by likes count ascending, with options to reorder.
   - **Inactive & Draft Handling**: Inactive questions/comments are visibly tagged and restricted according to ownership rules.
   - **Vote Reactions**: Upvote and downvote counters with optimistic client-side updates and toggling (untoggle on duplicate click).
5. **Interactive Comment Editing**:
   - Authors can edit the content of their comments inline; administrators cannot alter another user's comment text.
6. **User Profiles & Privacy**:
   - Authenticated members and administrators can view user profiles; guest access is restricted.
   - Profiles display user identity, avatar, role, reputation score, join date, and personal publications.
   - **Privacy Policy Compliance**: User email addresses are displayed **strictly to administrators and the account owner**; emails are omitted for other viewers.
   - **Administrative Profile Management**: Administrators can edit usernames (`login`), full names, and update profile avatars for any account. Email modification is reserved for the account owner.
7. **Drafts & Question Visibility (Drafts System)**:
   - Question authors can hide their questions (set to `inactive` / draft) or publish them at any time.
   - Supported at creation time via "Save as Draft", in question cards via an eye toggle button (`Eye` / `EyeOff`), and in the question details view.
   - Drafts remain strictly private to the author and administrators.
8. **Topic Categories & Safe Deletion**:
   - Comprehensive catalog of development topics and technologies.
   - Administrators can add new categories and delete existing ones.
   - **Default Category Protection**: The `General Discussions` category is protected and cannot be deleted.
   - **Automatic Reassignment**: When an administrator deletes a category (e.g., `Java`), all questions utilizing it are automatically transferred to `General Discussions` (if not already attached), ensuring zero orphan posts.

### 4.4 Act: Creative & Enhanced Features
1. **Modern Developer Theme (Dark & Light Mode)**:
   - High-contrast, polished developer aesthetic built on a Slate color palette, JetBrains-style code typography, and subtle glowing borders.
   - Persistent theme toggle stored in `localStorage`.
2. **Post Subscriptions & Feed (`/subscriptions`)**:
   - Follow questions to receive updates on new answers and status changes.
   - Dedicated subscriptions view with sorting and tag filtering.
3. **Personal Favorites Collection (`/favorites`)**:
   - Save essential references and solutions in one click with instant filter controls.
4. **In-App Notifications**:
   - Notification dropdown menu in the header displaying real-time updates and unread counters.
5. **Analytics & Leaderboard Dashboard (`/stats`)**:
   - Visual metrics covering total questions, registered contributors, topic diversity, top reputation leaderboard, and recent activity.
6. **Auxiliary Information Pages**:
   - Community **Guidelines** (`/guidelines`): Behavioral standards and communication code of conduct.
   - **Privacy Policy** (`/privacy`): Plain-language policy emphasizing zero data sharing and authentication-only email retention.
   - **API Health Status** (`/status`, `/health`): System status page connected directly to the backend health endpoint.
   - **Custom 404 Page**: Branded, minimalist error page with quick navigation back to discussions.

---

## 5. System Architecture & Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Client Browser (React 18 SPA)                         │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                             ThemeContext                                │   │
│   │             (Dark Theme / Light Theme with CSS Variables)               │   │
│   └────────────────────────────────────┬────────────────────────────────────┘   │
│                                        │                                        │
│   ┌────────────────────────────────────▼────────────────────────────────────┐   │
│   │                       React Router DOM (Routing)                        │   │
│   │   /, /posts/:id, /users/:id, /categories, /favorites, /stats, etc.      │   │
│   └────────────────────────────────────┬────────────────────────────────────┘   │
│                                        │                                        │
│   ┌────────────────────────────────────▼────────────────────────────────────┐   │
│   │                         Redux Toolkit Store                             │   │
│   │      authSlice  │  postsSlice  │  commentsSlice  │  notificationSlice   │   │
│   └────────────────────────────────────┬────────────────────────────────────┘   │
│                                        │                                        │
│   ┌────────────────────────────────────▼────────────────────────────────────┐   │
│   │                        Axios HTTP Client Layer                          │   │
│   │             (baseURL: '/api', withCredentials: true)                    │   │
│   └────────────────────────────────────┬────────────────────────────────────┘   │
└────────────────────────────────────────┼────────────────────────────────────────┘
                                         │ (Vite Proxy :5173 -> :3000)
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      Express.js REST API Server (:3000)                         │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │            CORS & express-session (MySQLStore Session Engine)           │   │
│   └────────────────────────────────────┬────────────────────────────────────┘   │
│                                        │                                        │
│   ┌────────────────────────────────────▼────────────────────────────────────┐   │
│   │                       Layered Controller Layer                          │   │
│   │     authController, postController, commentController, userController   │   │
│   └────────────────────────────────────┬────────────────────────────────────┘   │
│                                        │                                        │
│   ┌────────────────────────────────────▼────────────────────────────────────┐   │
│   │                        Domain Service Layer                             │   │
│   │             Validation, Threading Logic, Notification Dispatch          │   │
│   └────────────────────────────────────┬────────────────────────────────────┘   │
│                                        │                                        │
│   ┌────────────────────────────────────▼────────────────────────────────────┐   │
│   │                       SQL Repository Layer                              │   │
│   │        Parameterized Queries with mysql2/promise Connection Pool        │   │
│   └────────────────────────────────────┬────────────────────────────────────┘   │
│                                        │                                        │
│   ┌────────────────────────────────────▼────────────────────────────────────┐   │
│   │                         MySQL 8.0 Database (3NF)                        │   │
│   │   users, posts, categories, comments (with parent_id), likes, favorites,│   │
│   │   post_subscriptions, notifications, post_images, sessions              │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Frontend Routes Catalog

| Route | Access Level | Description |
| :--- | :--- | :--- |
| `/` | 🟢 Public (Guests & Users) | Main feed: question previews, dual sorting, multi-tag filters, pagination |
| `/posts/:id` | 🟢 Public | Full question view, attached media gallery, threaded comments, voting |
| `/categories` | 🟢 Public | Topic tags directory with question discovery (Admin: create & safely delete categories) |
| `/stats` | 🟢 Public | Platform analytics dashboard, contributor leaderboard, and platform metrics |
| `/guidelines` | 🟢 Public | Community conduct rules and technical question quality standards |
| `/privacy` | 🟢 Public | User data privacy declaration |
| `/status`, `/health` | 🟢 Public | Live API system health check page |
| `/login` | 🟢 Guests Only | Authentication view (login via username or email) |
| `/register` | 🟢 Guests Only | Account registration with format validation and email verification |
| `/password-reset` | 🟢 Guests Only | Password recovery request and token-based reset form |
| `/profile` | 🟡 Authenticated | Personal dashboard: update avatar, edit name/login/email, manage personal questions |
| `/users/:id` | 🟡 Authenticated | Public profile view of other community members (Email hidden; Admin can edit user info) |
| `/favorites` | 🟡 Authenticated | Curated collection of bookmarked questions with filtering and sorting |
| `/subscriptions` | 🟡 Authenticated | List of followed questions with real-time update notifications and filters |
| `*` | 🟢 Public | Custom branded 404 page with navigation shortcuts |

---

## 7. Pre-seeded Test Accounts

All test accounts are automatically generated during database seeding. Every account shares the same password: **`password123`**.

| Login | Password | Role | Permissions & Purpose |
| :--- | :--- | :--- | :--- |
| **`admin`** | `password123` | **Administrator** | Full administrative rights: manage categories, edit user profiles/avatars, toggle question statuses, view user emails |
| **`johndoe`** | `password123` | **User** | Author of active questions, discussions, and favorite collections |
| **`janesmith`** | `password123` | **User** | Active community member, commenter, and question subscriber |
| **`alexcode`** | `password123` | **User** | Technical contributor focused on architecture and database questions |
| **`emilyw`** | `password123` | **User** | Frontend and design-oriented contributor |

---
