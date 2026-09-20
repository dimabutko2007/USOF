# USOF Backend (Track Full Stack) 🚀

![USOF Architecture](https://img.shields.io/badge/Architecture-MVC%20%7C%20OOP%20%7C%20SOLID-blue)
![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green)
![Express](https://img.shields.io/badge/Express-v4.21-lightgrey)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)

USOF (Underflow Overflow) — це RESTful API бекенд веб-платформи для обговорень, відповідей на питання та взаємодії між користувачами. Проєкт побудований на стеку **Node.js, Express, MySQL** з дотриманням паттерну **MVC**, принципів **ООП (об’єктно-орієнтованого програмування)** та **SOLID**.

---

## 📋 Зміст
1. [Системні вимоги та залежності](#-системні-вимоги-та-залежності)
2. [Покрокова інструкція із запуску](#-покрокова-інструкція-із-запуску)
3. [Архітектура коду та алгоритм роботи](#-архітектура-коду-та-алгоритм-роботи)
4. [Документація API ендпоінтів та приклади використання ("in use")](#-документація-api-ендпоінтів-та-приклади-використання-in-use)
5. [Опис процесу розробки (CBL Framework)](#-опис-процесу-розробки-cbl-framework)

---

## 🛠 Системні вимоги та залежності

### Системні вимоги:
* **Node.js**: `v18.x` або вище
* **npm**: `v9.x` або вище
* **MySQL Server**: `8.0` або сумісний (наприклад, MariaDB, XAMPP)

### Основні залежності проєкту:
* `express` — веб-фреймворк для обробки HTTP-запитів.
* `mysql2` — драйвер для роботи з реляційною БД MySQL через `mysql2/promise` (Prepared Statements).
* `express-session` & `express-mysql-session` — аутентифікація на базі сесій та збереження сесій у MySQL cookie-store.
* `bcryptjs` — безпечне хешування паролів.
* `multer` — завантаження та обробка статичних аватарок/файлів.
* `nodemailer` — імітація надсилання email-повідомлень (підтвердження реєстрації та скидання пароля).
* `dotenv` — управління змінними середовища.

---

## 🚀 Покрокова інструкція із запуску

### 1. Клонування та перехід у директорію проєкту
```bash
git clone https://github.com/your-username/usof.git
cd usof
```

### 2. Встановлення залежностей
```bash
npm install
```

### 3. Налаштування змінних середовища (`.env`)
Створіть файл `.env` у корені проєкту на основі прикладу `.env.example`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootbutko
DB_NAME=usof_db
SESSION_SECRET=usof_super_secret_key_2026
APP_URL=http://localhost:3000
```

### 4. Автоматична ініціалізація бази даних
Запустіть скрипт для автоматичного створення бази даних `usof_db` та всіх необхідних таблиць:
```bash
npm run db:init
```

### 5. Заповнення бази тестовими даними (Seeders)
Запустіть сидери для заповнення таблиць тестовими даними (мінімум по 5 записів на кожну таблицю):
```bash
npm run db:seed
```

### 6. Запуск бекенд-сервера
```bash
npm start
```
Сервер буде доступний за адресою: `http://localhost:3000`

---

## 🏗 Архітектура коду та алгоритм роботи

Проєкт дотримується класичного **MVC (Model-View-Controller)** розділення із чітким виділенням шарів відповідно до принципів **SOLID**:

```
usof/
├── config/             # Налаштування підключення до БД та Nodemailer
│   ├── db.js
│   └── mailer.js
├── controllers/        # Обробники HTTP-запитів (HTTP status codes, response formatting)
├── services/           # Бізнес-логіка (Валідація, ролі, розрахунок рейтингу, токени)
├── repositories/       # DAO / Data Access Layer (Чисті SQL-запити через mysql2/promise)
├── middlewares/        # Захист маршрутів, RBAC ролі (Admin/User), Multer upload, Central Error Handler
├── routes/             # Ендпоінти Express Router
├── db/                 # Скрипти ініціалізації таблиць (init.js) та заповнення даними (seeders.js)
├── uploads/            # Локальне сховище статичних файлів/аватарок
├── .env                # Змінні оточення
├── app.js              # Точка входу Express додатка
└── package.json
```

### Алгоритм роботи програми:
1. **HTTP Запит**: Надходить до Express додатку через відповідний маршрут у `routes/`.
2. **Middleware**: Маршрут перевіряє сесію користувача (`authMiddleware`), авторизацію за ролями (`roleMiddleware`) або обробляє файли (`uploadMiddleware`).
3. **Controller**: Приймає вхідні дані запиту `req.body / req.params / req.query` та викликає відповідний метод сервісу.
4. **Service**: Стан бізнес-логіки. Виконує перевірки, виклики Nodemailer для email або звертається до репозиторію.
5. **Repository**: Виконує безпечні підготовлені SQL-запити (Prepared Statements) у базу MySQL через `mysql2/promise`.
6. **Автоматичний підрахунок рейтингу**: При додаванні/видаленні лайків чи дизлайків репозиторій автоматично перераховує `rating` автора поста/коментаря за формулою: `рейтинг = сума лайків - сума дизлайків`.

---

## 🔌 Документація API ендпоінтів та приклади використання ("in use")

### 🔐 1. Автентифікація (`/api/auth`)
* `POST /api/auth/register` — Реєстрація користувача (login, password, password confirmation, email).
* `GET /api/auth/confirm-email/:confirm_token` — Підтвердження email адреси.
* `POST /api/auth/login` — Вхід у систему (доступно лише для підтверджених email, встановлює session cookie).
* `POST /api/auth/logout` — Вихід із системи (знищення сесії).
* `POST /api/auth/password-reset` — Запит на скидання пароля (надсилання посилання).
* `POST /api/auth/password-reset/:confirm_token` — Підтвердження нового пароля.

#### Приклад запиту Входу (Login):
```http
POST /api/auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "login": "johndoe",
  "password": "password123"
}
```
**Відповідь:**
```json
{
  "status": "success",
  "message": "Logged in successfully.",
  "user": {
    "id": 2,
    "login": "johndoe",
    "full_name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "profile_picture": "default-avatar.png",
    "rating": 0
  }
}
```

---

### 👤 2. Модуль користувачів (`/api/users`)
* `GET /api/users/` — Список усіх користувачів.
* `GET /api/users/:user_id` — Дані конкретного користувача.
* `POST /api/users/` — Створення користувача/адміна (Доступно тільки для `Admin`).
* `PATCH /api/users/avatar` — Завантаження та оновлення аватарки (`multipart/form-data`).
* `PATCH /api/users/:user_id` — Оновлення профілю (Автор або Admin).
* `DELETE /api/users/:user_id` — Видалення профілю (Автор або Admin).

---

### 📝 3. Модуль постів (`/api/posts`)
* `GET /api/posts/` — Публічний список постів із пагінацією (`page`, `limit`), фільтрацією (`categories`, `startDate`, `endDate`, `status`) та сортуванням (`sort=likes` або `sort=date`).
* `GET /api/posts/:post_id` — Перегляд конкретного поста.
* `POST /api/posts/` — Створення поста.
* `PATCH /api/posts/:post_id` — Оновлення (заголовок, контент, категорії) — лише автор.
* `PATCH /api/posts/:post_id/status` — Зміна статусу `active`/`inactive` (лише `Admin`). Вміст інактивних постів редагувати заборонено.
* `DELETE /api/posts/:post_id` — Видалення поста.

---

### 💬 4. Модуль коментарів (`/api/comments`)
* `GET /api/posts/:post_id/comments` — Коментарі під постом.
* `POST /api/posts/:post_id/comments` — Додати коментар.
* `GET /api/comments/:comment_id` — Перегляд конкретного коментаря.
* `PATCH /api/comments/:comment_id` — Зміна статусу коментаря `active`/`inactive` (Вміст коментаря не редагується).
* `DELETE /api/comments/:comment_id` — Видалення коментаря.

---

### 👍 5. Модуль лайків та рейтингу
* `GET /api/posts/:post_id/like` — Список лайків поста.
* `POST /api/posts/:post_id/like` — Додати лайк/дизлайк під постом (`{ "type": "like" | "dislike" }`).
* `DELETE /api/posts/:post_id/like` — Видалити власний лайк/дизлайк з поста.
* `GET /api/comments/:comment_id/like` — Список лайків коментаря.
* `POST /api/comments/:comment_id/like` — Додати лайк/дизлайк під коментарем.
* `DELETE /api/comments/:comment_id/like` — Видалити власний лайк/дизлайк з коментаря.

---

### ⭐ 6. Креативні фічі (Act: Creative - Обране / Favorites)
* `POST /api/posts/:post_id/favorite` — Додати пост у закладки.
* `DELETE /api/posts/:post_id/favorite` — Видалити пост із закладок.
* `GET /api/favorites` — Список збережених постів користувача.

---

## 📈 Опис процесу розробки (CBL Framework)

Проєкт виконано за методологією **Challenge-Based Learning (CBL)** у три ключові етапи:

1. **Engage (Залучення)**:
   * Визначення ключової теми (розробка повнофункціонального RESTful API аналога StackOverflow/Underflow).
   * ФормулюванняGuiding Questions щодо збереження файлів, підтвердження пошти та захисту ролими.

2. **Investigate (Дослідження та Проєктування)**:
   * Проєктування схеми БД у MySQL з урахуванням нормалізації, первинних та зовнішніх ключів (FK), Many-to-Many зв'язків (`post_categories`) та унікальних обмежень (`unique_author_target`).
   * Вибір підходу чистих SQL-запитів на `mysql2/promise` для демонстрації принципів SOLID та OOP через Repository Pattern.

3. **Act (Дія та Реалізація)**:
   * Створення скриптів автоматичної ініціалізації та заповнення БД.
   * Послідовна реалізація модулів: Auth, Users, Categories, Posts, Comments, Likes, Rating System, Favorites.
   * Повне емпіричне автоматизоване тестування всіх ендпоінтів та обробки помилок.
