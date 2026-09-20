# 🚀 LinkedIn Publication Draft (Share Section)

Скопіюйте цей текст для публікації у ваш LinkedIn акаунт:

---

🚀 Завершено розробку проєкту **USOF Backend (Track Full Stack)** у рамках навчання в @Innovation Campus of NTU "KhPI"!

USOF (Underflow Overflow) — це повнофункціональний RESTful API бекенд веб-платформи для обговорень та взаємодії між користувачами, розроблений із використанням паттерна **MVC**, принципів **ООП** та **SOLID**.

### 🛠 Використані технології та стек:
- **Core**: Node.js, Express, JavaScript (ES6+).
- **Database**: MySQL, драйвер `mysql2/promise` (чистий SQL, Prepared Statements, Repository Pattern).
- **Authentication & Security**: Cookie-based sessions з `express-session` та `express-mysql-session`, хешування паролів за допомогою `bcryptjs`, RBAC розмежування прав (Admin / User).
- **File System & Mail**: `multer` для статичного збереження аватарок, `nodemailer` для імітації підтвердження пошти та скидання паролів.

### 💡 Ключові виклики та досягнення:
1. **Проєктування БД та автоініціалізація**: Реалізовано повністю автоматичні скрипти генерації схеми БД та заповнення тестовими даними (`npm run db:init` та `npm run db:seed`).
2. **Динамічна система рейтингу**: Створено автоматичний перерахунок рейтингу користувачів залежно від співвідношення лайків та дизлайків під їхніми постами та коментарями.
3. **Гнучка фільтрація та заблоковані пости**: Реалізовано пагінацію, фільтрацію за датами, категоріями та статусом, а також логіку адмінського блокування постів/коментарів.
4. **Додатковий функціонал**: Реалізовано модуль збереження постів в Обране (Favorites).

Це був чудовий досвід проектування чистої та масштабованої бекенд-архітектури!

#InnovationCampusKhPI #Nodejs #Express #MySQL #FullStack #Backend #JavaScript #SOLID #CleanCode #WebDevelopment
