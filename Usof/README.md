# USOF — User StackOverflow REST API Backend

![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-brightgreen)
![Express Version](https://img.shields.io/badge/Express-v4.21.2-blue)
![Database](https://img.shields.io/badge/Database-MySQL%208.0-orange)
![Architecture](https://img.shields.io/badge/Architecture-MVC%20%7C%20SOLID%20%7C%20OOP-purple)
![License](https://img.shields.io/badge/License-ISC-lightgrey)

---

## 1. Short Description

**USOF** (User StackOverflow) is a full-featured RESTful API backend for a web-based Questions and Answers platform, designed after Stack Overflow. The application provides a scalable foundation for user-driven technical communities, allowing developers to register, post technical questions, write answers and comments, upvote/downvote content, categorize posts with tags, bookmark favorites, and receive email/in-app notifications for post updates.

### Key Capabilities
- **Authentication & Security**: Secure registration, email verification links, session-based authentication stored in MySQL, password hashing (`bcrypt`), and password reset token workflows.
- **Role-Based Authorization**: Distinct access levels for **Guest** (unauthenticated visitors), **User** (authenticated members), and **Admin** (platform administrators).
- **Q&A System**: Rich post management, tagging system, multi-category assignment, post status toggles (active/inactive), and multi-level comment threads.
- **Engagement & Community**: Upvote/downvote reaction engine for posts and comments, post subscriptions with automated notification dispatch, and personal favorites bookmarking.
- **Media Uploads**: Built-in multipart image upload support for user avatars and post attachments.

### Architectural Highlights
- **MVC Pattern**: Clear separation of concerns between API Routes, Controllers, Services, and Repositories.
- **OOP & SOLID Principles**: Modular design utilizing class-based services and repositories, adhering to Single Responsibility, Open/Closed, and Dependency Inversion principles.
- **Robust Tech Stack**: Express.js server backed by a normalized MySQL relational database with connection pooling and server-side MySQL session storage.

---

## 2. Requirements and Dependencies

### System Requirements
To build and run this solution locally, ensure the following software is installed on your machine:

| Software | Minimum Version | Recommended Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v18.0.0` | `v20.x` or `v24.x` | JavaScript runtime environment |
| **npm** | `v9.0.0` | `v10.x` | Node package manager |
| **MySQL Server** | `v8.0` | `v8.0+` | Relational Database Management System |

### npm Package Dependencies

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "express-mysql-session": "^3.0.3",
    "express-session": "^1.18.1",
    "multer": "^1.4.5-lts.1",
    "mysql2": "^3.12.0",
    "nodemailer": "^6.10.0"
  }
}
```

- **`express`**: Fast, unopinionated web framework for Node.js handling HTTP routing and middleware execution.
- **`mysql2`**: High-performance MySQL client supporting prepared statements, connection pooling, and Promises.
- **`bcryptjs`**: Secure password hashing library using salt rounds to protect stored credentials.
- **`multer`**: Middleware for handling `multipart/form-data`, used for uploading avatars and post images.
- **`express-session` & `express-mysql-session`**: Server-side session management persisted in a MySQL table (`sessions`).
- **`dotenv`**: Zero-dependency module loading environment variables from `.env` into `process.env`.
- **`nodemailer`**: Node.js email delivery client used for email verification and password reset notifications.

---

## 3. How to Run Your Solution

Follow these step-by-step instructions to clone, configure, initialize, and execute the project locally.

### Step 1: Clone the Repository
Open your terminal and clone the repository:
```bash
git clone ssh://git@git.green-lms.app:22022/challenge-667/dbutko-12074.git
cd Usof
```

### Step 2: Install Project Dependencies
Install all required Node.js packages:
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a local `.env` configuration file from the provided template:
```bash
cp .env.example .env
```
Open `.env` in your code editor and adjust your local configuration (e.g., MySQL connection credentials):

```env
# Server Configuration
PORT=3000
SESSION_SECRET=usof_super_secret_key_2026

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=usof_db

# Mailer Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="USOF Support <no-reply@usof.com>"
```

### Step 4: Initialize & Seed the MySQL Database
Make sure your MySQL server is running, then run the database setup scripts:

1. **Initialize Database Schema and Tables**:
   ```bash
   npm run db:init
   ```
   *This command creates the database schema, normalized tables (`users`, `posts`, `categories`, `post_categories`, `comments`, `likes`, `favorites`, `subscriptions`, `notifications`), triggers, and indexes.*

2. **Seed Initial Mock Data**:
   ```bash
   npm run db:seed
   ```
   *This populates the database with initial categories, default users (including an administrator `admin`), demo posts, and test comments.*

### Step 5: Start the API Server
Run the production server:
```bash
npm start
```
The server will start listening at: `http://localhost:3000`

### Step 6: Run Automated API Verification Suite
To run the end-to-end automated test suite verifying all basic and creative API endpoints:
```bash
npm test
```

---

## 4. Screenshots of Solution

This section contains visual evidence of the USOF REST API operating successfully.

### 4.1 Server Launch & Database Initialization
![Server Launch Console](./docs/screenshots/server_startup.png)
*Figure 4.1: Terminal console showing database initialization, table creation, seed execution, and server listening on port 3000.*

### 4.2 Automated API Test Suite Execution
![Automated API Test Suite Execution](./docs/screenshots/test_results.png)
*Figure 4.2: Successful execution of `test_api.js` verifying all Auth, User, Post, Category, Comment, Like, Favorite, and Notification routes.*

### 4.3 Postman / Insomnia Endpoint Execution
![Postman API Execution](./docs/screenshots/postman_execution.png)
*Figure 4.3: Example Postman requests showcasing authentication response (`POST /api/auth/login`), post creation (`POST /api/posts`), and user profile management.*

> 📌 **Note for Evaluators & Maintainers**:
> Replace the placeholder image paths in `./docs/screenshots/` with actual screenshots of your local execution before submission.

---

## 5. Full-Fledged Documentation & Progress

### 5.1 Progress After Every Completed CBL Stage

The project was executed following the **Challenge-Based Learning (CBL)** framework, divided into three main phases:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     ENGAGE      │ ────> │   INVESTIGATE   │ ────> │       ACT       │
│  Problem Scope  │       │ Architectural   │       │ Basic & Creative│
│  & Objectives   │       │ Technical Plan  │       │ Features Launch │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

#### 1. Engage Stage
- **Problem Statement**: Standard Q&A platforms require modular, reliable, and secure RESTful backend services capable of handling complex relational data (users, questions, answers, upvotes, subscriptions).
- **Goal Definition**: Design and implement a robust Node.js/Express backend mimicking Stack Overflow's features, structured according to modern OOP and SOLID software design practices.
- **Domain Scoping**: Defined user personas (Guest, User, Administrator) and primary domain entities (Users, Posts, Categories, Comments, Reactions, Favorites, Subscriptions, Notifications).

#### 2. Investigate Stage
- **Tech Stack Evaluation**: Analyzed REST architectural standards, MySQL relational database normalized to 3NF, Express.js middleware ecosystems, and server-side MySQL session storage.
- **Architectural Design**: Adopted the **MVC / Layered Architecture** pattern (Routes -> Controllers -> Services -> Repositories -> MySQL Database) to strictly enforce separation of concerns.
- **Security & Validation Rules**: Formulated rules for secure password hashing (`bcrypt`), email verification tokens, role middleware guards, file size/type restrictions for avatars and post images, and central error handling.

#### 3. Act Stage (Basic Features)
- Built core REST API endpoints:
  - **Authentication Subsystem**: Registration with email confirmation links, login/logout sessions, password reset workflow.
  - **User Subsystem**: Profile management, user list pagination, role updates (User vs Admin), account deletion.
  - **Post Subsystem**: Post creation, retrieval, filtering/sorting, update, status toggle (active/inactive), and tagging.
  - **Comment Subsystem**: Adding answers/comments to posts, retrieving nested comment trees, comment updates.
  - **Reaction Engine**: Liking/disliking posts and comments with atomic transaction management.

#### 4. Act Stage (Creative Features)
- Expanded the backend with production-ready features:
  - **File Upload Engine**: Implemented `multer` middleware for handling user avatar uploads and multiple post image attachments.
  - **Post Subscriptions & Notifications**: Implemented post follow/unfollow capability with automatic email alerts (`nodemailer`) and in-app notification tracking when new comments are posted.
  - **Personal Favorites**: Allowed users to save posts to their personal collection (`/api/favorites`).
  - **Centralized Error Handling**: Designed an express `errorHandler` middleware and custom `ApiError` domain model.
  - **Automated Verification Suite**: Built a zero-dependency E2E integration test script (`test_api.js`) verifying all route edge cases and access controls.

---

### 5.2 Algorithm & Architecture

#### Architecture Pattern: Layered MVC + Repository Pattern
The application follows a clean, 4-tier layered software architecture designed around **Object-Oriented Programming (OOP)** and **SOLID principles**:

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                            HTTP REST Client                             │
 └────────────────────────────────────┬────────────────────────────────────┘
                                      │ (HTTP Request)
                                      ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                              Router Layer                               │
 │   Routes incoming HTTP endpoints & attaches Auth / Upload Middlewares   │
 └────────────────----------------────┬────────────────────────────────────┘
                                      │
                                      ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                            Controller Layer                             │
 │   Parses HTTP requests, extracts parameters, formats HTTP responses    │
 └────────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                              Service Layer                              │
 │   Contains core Business Logic, domain validations & workflow rules    │
 └────────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                            Repository Layer                             │
 │   Direct SQL execution, database connection pool queries & mapping      │
 └────────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                         MySQL Database (3NF)                            │
 └─────────────────────────────────────────────────────────────────────────┘
```

#### Step-by-Step Request Lifecycle Algorithm
1. **Request Dispatching**: Client sends an HTTP request (e.g., `POST /api/posts`).
2. **Route Guarding & Middleware Execution**:
   - `authMiddleware`: Verifies session cookie (`usof_sid`). Rejects unauthenticated requests with `401 Unauthorized`.
   - `uploadMiddleware`: Processes incoming `multipart/form-data` via `multer`, saving uploaded files into `/uploads/posts/`.
3. **Controller Handling**: `postController.createPost` extracts validated body data (`title`, `content`, `categories`) and user identity from session (`req.session.user`).
4. **Service Business Logic**: `postService.createPost` validates entity rules (e.g., checking category existence), formats data, and orchestrates repository calls.
5. **Repository Data Access**: `postRepository.create` constructs parameterised SQL queries (`INSERT INTO posts ...`) preventing SQL injection, and executes them via `mysql2` connection pool.
6. **Notification Dispatch**: If created, `subscriptionService` queries subscribers of the topic and sends background email / in-app notifications.
7. **Response Serialization**: Controller wraps result into a standard JSON response envelope (`{ status: "success", data: ... }`) returning standard HTTP status codes (`201 Created`).

#### Adherence to SOLID Principles
- **Single Responsibility Principle (SRP)**: Controllers handle HTTP serialization, Services hold business logic, Repositories handle raw SQL.
- **Open/Closed Principle (OCP)**: Middlewares and Service interfaces can be extended (e.g., adding OAuth or S3 uploads) without modifying existing controllers.
- **Liskov Substitution & Interface Segregation**: Repositories expose concise, single-purpose interface methods for entity queries.
- **Dependency Inversion Principle (DIP)**: Controllers rely on abstract service layers rather than writing raw database queries directly.

---

### 5.3 API Endpoints List

Below is the complete catalog of available REST API routes and their access permissions.

#### Access Role Hierarchy
- 🟢 **Guest**: Publicly accessible without authentication.
- 🟡 **User**: Requires an active, authenticated user session.
- 🔴 **Admin**: Requires administrator privileges (`role === 'admin'`).

---

#### 🔑 1. Authentication Module (`/api/auth`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | 🟢 Guest | Register a new user account and send confirmation email. |
| `GET` | `/api/auth/confirm-email/:token` | 🟢 Guest | Verify email address via token from email link. |
| `POST` | `/api/auth/login` | 🟢 Guest | Authenticate user credentials and create HTTP session. |
| `POST` | `/api/auth/logout` | 🟡 User / 🔴 Admin | Destroy active session cookie. |
| `POST` | `/api/auth/password-reset` | 🟢 Guest | Request password reset token sent via email. |
| `POST` | `/api/auth/password-reset/:token` | 🟢 Guest | Set new password using valid reset token. |

---

#### 👤 2. User Management Module (`/api/users`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | 🟡 User / 🔴 Admin | Retrieve list of all registered users. |
| `GET` | `/api/users/:user_id` | 🟢 Guest | Retrieve public profile information for a specific user. |
| `POST` | `/api/users` | 🔴 Admin | Manually create a new user account. |
| `PATCH` | `/api/users/avatar` | 🟡 User / 🔴 Admin | Upload or update avatar image for current user. |
| `PATCH` | `/api/users/:user_id` | 🟡 Owner / 🔴 Admin | Update user details (login, email, role, rating). |
| `DELETE` | `/api/users/:user_id` | 🟡 Owner / 🔴 Admin | Delete user account and associated credentials. |

---

#### 🏷️ 3. Categories Module (`/api/categories`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | 🟢 Guest | Retrieve list of all question categories. |
| `GET` | `/api/categories/:category_id` | 🟢 Guest | Retrieve category details by ID. |
| `GET` | `/api/categories/:category_id/posts` | 🟢 Guest | Retrieve all posts associated with a specific category. |
| `POST` | `/api/categories` | 🔴 Admin | Create a new category. |
| `PATCH` | `/api/categories/:category_id` | 🔴 Admin | Update category title or description. |
| `DELETE` | `/api/categories/:category_id` | 🔴 Admin | Delete a category. |

---

#### 📝 4. Posts Module (`/api/posts`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts` | 🟢 Guest | Retrieve paginated posts (supports sorting by date/likes & filtering). |
| `GET` | `/api/posts/:post_id` | 🟢 Guest | Retrieve full post details, author, attached categories & images. |
| `GET` | `/api/posts/:post_id/categories` | 🟢 Guest | Retrieve categories associated with a post. |
| `POST` | `/api/posts` | 🟡 User / 🔴 Admin | Create a new Q&A post with optional image uploads. |
| `PATCH` | `/api/posts/:post_id` | 🟡 Author / 🔴 Admin | Update post title, content, or attached categories. |
| `PATCH` | `/api/posts/:post_id/status` | 🔴 Admin | Toggle post status (`active` vs `inactive`). |
| `DELETE` | `/api/posts/:post_id` | 🟡 Author / 🔴 Admin | Delete a post. |
| `POST` | `/api/posts/:post_id/subscribe` | 🟡 User / 🔴 Admin | Subscribe to email & in-app updates for a post. |
| `DELETE` | `/api/posts/:post_id/subscribe` | 🟡 User / 🔴 Admin | Unsubscribe from updates for a post. |

---

#### 💬 5. Comments Module (`/api/posts/:post_id/comments` & `/api/comments`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts/:post_id/comments` | 🟢 Guest | Retrieve all comments for a specific post. |
| `POST` | `/api/posts/:post_id/comments` | 🟡 User / 🔴 Admin | Add a new comment/answer to a post. |
| `GET` | `/api/comments/:comment_id` | 🟢 Guest | Retrieve a specific comment by ID. |
| `PATCH` | `/api/comments/:comment_id` | 🟡 Author / 🔴 Admin | Update comment status or content. |
| `DELETE` | `/api/comments/:comment_id` | 🟡 Author / 🔴 Admin | Delete a comment. |

---

#### 👍 6. Likes & Reactions Module (`/api/posts/:id/like` & `/api/comments/:id/like`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts/:post_id/like` | 🟢 Guest | Get reaction counts and list of likes for a post. |
| `POST` | `/api/posts/:post_id/like` | 🟡 User / 🔴 Admin | Add a `like` or `dislike` reaction to a post. |
| `DELETE` | `/api/posts/:post_id/like` | 🟡 User / 🔴 Admin | Remove existing reaction from a post. |
| `GET` | `/api/comments/:comment_id/like` | 🟢 Guest | Get reaction counts for a comment. |
| `POST` | `/api/comments/:comment_id/like` | 🟡 User / 🔴 Admin | Add a `like` or `dislike` reaction to a comment. |
| `DELETE` | `/api/comments/:comment_id/like` | 🟡 User / 🔴 Admin | Remove reaction from a comment. |

---

#### ⭐ 7. Favorites Module (`/api/favorites` & `/api/posts/:id/favorite`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/favorites` | 🟡 User / 🔴 Admin | Retrieve list of posts saved in current user's favorites. |
| `POST` | `/api/posts/:post_id/favorite` | 🟡 User / 🔴 Admin | Add a post to user's personal favorites list. |
| `DELETE` | `/api/posts/:post_id/favorite` | 🟡 User / 🔴 Admin | Remove a post from user's personal favorites list. |

---

#### 🔔 8. Notifications Module (`/api/notifications`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | 🟡 User / 🔴 Admin | Get list of notifications for the authenticated user. |
| `PATCH` | `/api/notifications/:id/read` | 🟡 User / 🔴 Admin | Mark a specific notification as read. |

---
