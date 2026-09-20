# Структура проєкту USOF (User StackOverflow Backend)

У цьому файлі описується повна структура директорій та файлів проєкту **USOF** (REST API веб-додатка за аналогією до Stack Overflow).

---

## 🌳 Дерево каталогу

```
USOF/
├── config/
│   ├── db.js
│   └── mailer.js
├── controllers/
│   ├── authController.js
│   ├── categoryController.js
│   ├── commentController.js
│   ├── favoriteController.js
│   ├── likeController.js
│   ├── postController.js
│   └── userController.js
├── db/
│   ├── init.js
│   └── seeders.js
├── middlewares/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   ├── roleMiddleware.js
│   └── uploadMiddleware.js
├── repositories/
│   ├── categoryRepository.js
│   ├── commentRepository.js
│   ├── favoriteRepository.js
│   ├── likeRepository.js
│   ├── postRepository.js
│   └── userRepository.js
├── routes/
│   ├── authRoutes.js
│   ├── categoryRoutes.js
│   ├── commentRoutes.js
│   ├── favoriteRoutes.js
│   ├── likeRoutes.js
│   ├── postRoutes.js
│   ├── standaloneCommentRoutes.js
│   └── userRoutes.js
├── services/
│   ├── authService.js
│   ├── categoryService.js
│   ├── commentService.js
│   ├── favoriteService.js
│   ├── likeService.js
│   ├── postService.js
│   └── userService.js
├── uploads/
│   └── default-avatar.png
├── .env
├── .env.example
├── app.js
├── package.json
├── package-lock.json
├── README.md
└── test_api.js
```

---

## 📁 Опис директорій та файлів

### ⚙️ Кореневі файли (Root Files)

- **[app.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/app.js)** — Головна точка входу додатку (Express сервер). Ініціалізує мідлвари, Express-сесії у MySQL, маршрути API (`/api/...`), роздачу статичних файлів та глобальну обробку помилок.
- **[.env](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/.env)** — Файл конфігурації середовища з приватними змінними (порт, параметри бази даних, сесійні секрети, налаштування SMTP mailer).
- **[.env.example](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/.env.example)** — Шаблон файлу конфігурації середовища для демонстрації потрібних змінних.
- **[package.json](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/package.json)** — Метадані проєкту, npm-скрипти запуску/ініціалізації (`npm start`, `npm run dev`, `npm run db:init`, `npm run db:seed`) та залежності пакетів.
- **[package-lock.json](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/package-lock.json)** — Фіксоване дерево залежностей npm.
- **[README.md](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/README.md)** — Основна документація проєкту USOF (інструкція з встановлення, запуску, опис API ендпоінтів та архітектури).
- **[test_api.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/test_api.js)** — Скрипт автоматизованого тестування REST API ендпоінтів проєкту.

---

### 🔧 `config/` — Конфігурації системи

- **[config/db.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/config/db.js)** — Конфігурація та створення пулу підключень MySQL (використовує бібліотеку `mysql2/promise`).
- **[config/mailer.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/config/mailer.js)** — Налаштування Nodemailer для відправки email-повідомлень (підтвердження реєстрації, скидання пароля).

---

### 🎮 `controllers/` — Контролери (Обробники HTTP-запитів)

Приймають HTTP-запити, зчитують параметри/тіло запиту, звертаються до відповідних сервісів і повертають JSON-відповідь.

- **[controllers/authController.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/controllers/authController.js)** — Реєстрація, вхід, вихід, підтвердження пошти за токеном, запит та підтвердження скидання пароля.
- **[controllers/userController.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/controllers/userController.js)** — Отримання списку користувачів, створення користувача адміністратором, завантаження аватара, зміна ролі та видалення.
- **[controllers/postController.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/controllers/postController.js)** — Створення, перегляд, оновлення, видалення публікацій, отримання категорій та коментарів поста.
- **[controllers/categoryController.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/controllers/categoryController.js)** — CRUD операції для категорій публікацій.
- **[controllers/commentController.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/controllers/commentController.js)** — Створення коментарів до поста, перегляд, оновлення та видалення коментарів.
- **[controllers/likeController.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/controllers/likeController.js)** — Додавання/видалення вподобань (лайків та дизлайків) для постів та коментарів.
- **[controllers/favoriteController.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/controllers/favoriteController.js)** — Управління обраними постами (додавання в обране, видалення з обраного, перегляд обраного).

---

### 🗄️ `db/` — База даних та міграції/сейдери

- **[db/init.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/db/init.js)** — Скрипт автоматичного створення структури SQL-таблиць (users, posts, categories, post_categories, comments, likes, favorites).
- **[db/seeders.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/db/seeders.js)** — Скрипт заповнення бази даних початковими тестовими даними (адміністратор, звичайні користувачі, категорії, пости, коментарі).

---

### 🛡️ `middlewares/` — Проміжні обробники (Middlewares)

- **[middlewares/authMiddleware.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/middlewares/authMiddleware.js)** — Перевірка авторизації користувача (перевірка наявності активної Express-сесії).
- **[middlewares/roleMiddleware.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/middlewares/roleMiddleware.js)** — Перевірка наявності потрібної ролі користувача (наприклад, перевірка чи є користувач `admin`).
- **[middlewares/uploadMiddleware.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/middlewares/uploadMiddleware.js)** — Конфігурація `multer` для безпечного завантаження зображень аватара (перевірка типів файлів та обмеження за розміром).
- **[middlewares/errorMiddleware.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/middlewares/errorMiddleware.js)** — Клас `ApiError` та централізований обробник помилок для приведення відповідей про помилки до єдиного формату JSON.

---

### 🗃️ `repositories/` — Репозиторії (Рівень доступу до даних / SQL-запити)

Відповідають за пряме виконання SQL-запитів до MySQL бази даних.

- **[repositories/userRepository.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/repositories/userRepository.js)** — Запити до таблиці `users` (знайти по email/login/id, створити, оновити аватар, змінити роль, видалити).
- **[repositories/postRepository.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/repositories/postRepository.js)** — Запити до таблиць `posts` та `post_categories` (пагінація, фільтрація за датою/категоріями/статусом, сортування, зв'язки з авторами).
- **[repositories/categoryRepository.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/repositories/categoryRepository.js)** — Запити до таблиці `categories` (пошук, створення, редагування, видалення).
- **[repositories/commentRepository.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/repositories/commentRepository.js)** — Запити до таблиці `comments` (додавання коментаря, вибірка за post_id або comment_id, оновлення, видалення).
- **[repositories/likeRepository.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/repositories/likeRepository.js)** — Запити до таблиці `likes` (перевірка існуючого лайка/дизлайка, створення, зміна типу `like`/`dislike`, видалення, підрахунок рейтингу).
- **[repositories/favoriteRepository.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/repositories/favoriteRepository.js)** — Запити до таблиці `favorites` (додавання в обране, вилучення, перегляд обраних постів користувача).

---

### 🛣️ `routes/` — Маршрутизація (API Endpoints)

Визначають URL-ендпоінти, призначають мідлвари авторизації/доступу та передають запит у відповідний контролер.

- **[routes/authRoutes.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/routes/authRoutes.js)** — Маршрути авторизації (`POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, підтвердження пошти та скидання пароля).
- **[routes/userRoutes.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/routes/userRoutes.js)** — Маршрути користувачів (`GET /api/users`, `GET /api/users/:user_id`, `PATCH /api/users/avatar`, `PATCH /api/users/:user_id/role`, `DELETE /api/users/:user_id`).
- **[routes/postRoutes.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/routes/postRoutes.js)** — Маршрути публікацій (`GET /api/posts`, `GET /api/posts/:post_id`, `POST /api/posts`, `PATCH /api/posts/:post_id`, `DELETE /api/posts/:post_id`).
- **[routes/categoryRoutes.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/routes/categoryRoutes.js)** — Маршрути категорій (`GET /api/categories`, `GET /api/categories/:category_id`, `POST /api/categories`, `PATCH /api/categories/:category_id`, `DELETE /api/categories/:category_id`).
- **[routes/commentRoutes.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/routes/commentRoutes.js)** — Вкладені маршрути коментарів до поста (`GET /api/posts/:post_id/comments`, `POST /api/posts/:post_id/comments`).
- **[routes/standaloneCommentRoutes.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/routes/standaloneCommentRoutes.js)** — Маршрути для окремої роботи з коментарями (`GET /api/comments/:comment_id`, `PATCH /api/comments/:comment_id`, `DELETE /api/comments/:comment_id`).
- **[routes/likeRoutes.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/routes/likeRoutes.js)** — Маршрути для лайків/дизлайків постів та коментарів.
- **[routes/favoriteRoutes.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/routes/favoriteRoutes.js)** — Маршрути для роботи з обраними публікаціями.

---

### 🧠 `services/` — Сервіси (Бізнес-логіка)

Містять бізнес-правила, перевірки прав доступу, обробку паролів, відправку листів та координацію між репозиторіями.

- **[services/authService.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/services/authService.js)** — Хешування паролів (bcrypt), перевірка логіна, відправка листів верифікації та відновлення доступу, генерація токенів.
- **[services/userService.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/services/userService.js)** — Валідація та оновлення профілю, управління аватарами користувача, перевірка адмін-прав при зміні ролі.
- **[services/postService.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/services/postService.js)** — Створення постів з прив'язкою категорій, валідація авторів при редагуванні/видаленні, сортування та фільтрація.
- **[services/categoryService.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/services/categoryService.js)** — Перевірка унікальності назв категорій та керування ними.
- **[services/commentService.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/services/commentService.js)** — Створення, перевірка прав автора чи адміна на оновлення/видалення коментарів.
- **[services/likeService.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/services/likeService.js)** — Логіка голосування (встановлення лайка/дизлайка, скасування голосу, зміна рішення).
- **[services/favoriteService.js](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/services/favoriteService.js)** — Додавання та вилучення постів із списку обраного користувача.

---

### 🖼️ `uploads/` — Директорія для збереження статичних файлів

- **[uploads/default-avatar.png](file:///c:/Dimon/Workplace/vsCodeProjects/Usof/uploads/default-avatar.png)** — Дефолтна аватарка для нових користувачів. Також у цю папку зберігаються завантажені користувачами файли аватарок.
