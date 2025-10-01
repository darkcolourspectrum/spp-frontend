# Schedule Platform Plus - Frontend Setup

## Что реализовано

### ✅ Базовая инфраструктура
- **Axios** с автоматическим обновлением токенов через interceptors
- **Redux Toolkit** для управления состоянием
- **React Router** с защищенными маршрутами
- **Vite proxy** для проксирования запросов к трем микросервисам

### ✅ Аутентификация
- Компоненты **Login** и **Register**
- Access token хранится **только в Redux** (в памяти приложения)
- Refresh token автоматически в **httpOnly cookie** (бэкенд устанавливает)
- Автоматическое обновление токена при 401 ошибке
- Проверка активной сессии при запуске приложения

### ✅ Роутинг
- **ProtectedRoute** компонент для защиты маршрутов
- Проверка ролей (admin, teacher, student, guest)
- Автоматический редирект в зависимости от роли

### ✅ Архитектура
```
src/
├── api/                      # HTTP клиенты
│   ├── auth/                 # Auth Service API
│   │   ├── index.ts          # Функции запросов
│   │   └── types.ts          # TypeScript типы
│   ├── endpoints.ts          # URL константы для всех сервисов
│   ├── instance.ts           # Axios instance с interceptors
│   └── index.ts              # Главный экспорт
│
├── modules/                  # Модули по фичам
│   └── auth/
│       ├── components/       # Login, Register, ProtectedRoute
│       └── store/
│           └── authorization/
│               ├── authReducer.ts      # Redux slice
│               └── actionCreators.ts   # Async thunks
│
├── store/                    # Центральный Redux store
│   ├── index.ts              # configureStore
│   └── hooks.ts              # Типизированные хуки
│
├── routes.tsx                # Роутинг приложения
└── App.tsx                   # Главный компонент
```

## Как работает система токенов

### Access Token (в памяти Redux)
1. После login/register получаем access token
2. Сохраняем в Redux state (`auth.accessToken`)
3. Axios interceptor добавляет его в каждый запрос (`Authorization: Bearer ...`)
4. **НЕ сохраняется** в localStorage/sessionStorage
5. При перезагрузке страницы - исчезает (безопасность)

### Refresh Token (httpOnly cookie)
1. Backend автоматически устанавливает в cookie после login/register
2. Frontend **НЕ имеет доступа** к этому токену (httpOnly)
3. Автоматически отправляется с каждым запросом через `withCredentials: true`

### Автоматическое обновление
1. Пользователь делает запрос
2. Если access token протух → 401 ошибка
3. Axios interceptor автоматически вызывает `/api/auth/refresh`
4. Получаем новый access token
5. Обновляем в Redux
6. Повторяем оригинальный запрос
7. Если refresh токен тоже протух → выход из системы

### Проверка сессии при запуске
1. При загрузке приложения вызывается `checkAuthStatus`
2. Пытаемся обновить токен через refresh
3. Если успешно → пользователь остается залогинен
4. Если нет → показываем страницу входа

## Запуск проекта

### 1. Установка зависимостей
```bash
npm install
```

### 2. Убедитесь что бэкенд запущен
Все три сервиса должны быть доступны:
- Auth Service: `http://localhost:8000`
- Schedule Service: `http://localhost:8001`
- Profile Service: `http://localhost:8002`

### 3. Запуск фронтенда
```bash
npm run dev
```

Приложение откроется на `http://localhost:3000`

## Доступные маршруты

### Публичные
- `/login` - Вход в систему
- `/register` - Регистрация

### Защищенные (требуют аутентификации)
- `/dashboard` - Общий дашборд (все роли)
- `/admin/dashboard` - Админ панель (только admin)
- `/teacher/schedule` - Расписание преподавателя (teacher, admin)
- `/student/schedule` - Расписание студента (student, admin)

### Редиректы
- `/` → автоматический редирект в зависимости от роли
- Неавторизованные пользователи → `/login`
- Пользователи без нужной роли → их дефолтная страница

## Vite Proxy настройки

В `vite.config.ts` настроен proxy для всех трех сервисов:

```typescript
'/api/auth'     → http://localhost:8000/api/v1/auth
'/api/profile'  → http://localhost:8002/api/v1/profiles  
'/api/schedule' → http://localhost:8001/api/v1/schedule
```

Это позволяет:
- Избежать CORS проблем в разработке
- Использовать относительные пути в запросах
- Упростить переход на API Gateway в будущем

## Что дальше?

### Следующие шаги разработки:
1. ✅ **Базовая инфраструктура** - ГОТОВО
2. ✅ **Auth модуль** - ГОТОВО
3. 🔄 **Layout и навигация** - следующее
4. 🔄 **Profile модуль** - интеграция с Profile Service
5. 🔄 **Schedule модуль** - интеграция с Schedule Service
6. 🔄 **Дашборд** - сводная информация для ролей

### Рекомендации для продакшена:
- Создать **API Gateway** на бэкенде (Nginx или FastAPI)
- Настроить **HTTPS** для production
- Добавить **Rate Limiting** на фронтенде
- Реализовать **Error Boundary** компоненты
- Добавить **логирование** (Sentry, LogRocket)

## Тестирование

### Тест регистрации:
1. Перейти на `/register`
2. Заполнить форму (email, пароль, имя, фамилия)
3. Принять политику конфиденциальности
4. Нажать "Зарегистрироваться"
5. После успешной регистрации → автоматический вход и редирект на `/student/schedule`

### Тест входа:
1. Перейти на `/login`
2. Ввести email и пароль
3. Нажать "Войти"
4. Редирект в зависимости от роли пользователя

### Тест защищенных маршрутов:
1. Попробовать зайти на `/admin/dashboard` без входа → редирект на `/login`
2. Войти как student → попытка зайти на `/admin/dashboard` → редирект на `/student/schedule`
3. Войти как admin → доступ ко всем маршрутам

## Известные ограничения

- Пока нет API Gateway (используется Vite proxy для разработки)
- Placeholder страницы для дашбордов (будут заменены)
- Нет обработки специфичных ошибок (429 Too Many Requests, 500 Server Error)
- Нет offline режима
- Нет i18n (интернационализации)

## Troubleshooting

### Ошибка CORS
Убедитесь что:
- Бэкенд запущен
- Vite dev server запущен на порту 3000
- В бэкенде CORS настроен на `http://localhost:3000`

### Токен не обновляется
Проверьте:
- Refresh token cookie устанавливается (DevTools → Application → Cookies)
- `withCredentials: true` в axios config
- Backend возвращает `Set-Cookie` header

### 401 при каждом запросе
- Проверьте что access token сохраняется в Redux
- Откройте Redux DevTools и проверьте `auth.accessToken`
- Убедитесь что `window.__REDUX_STORE__` доступен для interceptor

---

**Разработчик**: Ваше имя  
**Дата**: 2025  
**Версия**: 1.0.0