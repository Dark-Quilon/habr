@echo off
chcp 65001 >nul
echo ========================================
echo   Запуск проекта Habr
echo ========================================
echo.

REM Проверяем Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ОШИБКА] Docker не найден!
    echo Убедитесь что Docker Desktop установлен и запущен.
    pause
    exit /b 1
)

echo [OK] Docker найден
echo.

REM Создаём .env если нет
if not exist .env (
    copy .env.example .env >nul
    echo [OK] Создан .env
)

REM Создаём .env.local для фронтенда если нет
if not exist frontend\.env.local (
    copy frontend\.env.local.example frontend\.env.local >nul
    echo [OK] Создан frontend\.env.local
)

echo.
echo [Запуск] docker-compose up --build -d
echo Подождите, это может занять время...
echo.

docker-compose up --build -d

if %errorlevel% neq 0 (
    echo.
    echo [ОШИБКА] Не удалось запустить контейнеры!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Проект запущен!
echo ========================================
echo.
echo   Фронтенд:  http://localhost:3000
echo   Бэкенд:    http://localhost:8000
echo   GitLab:    http://localhost:8080
echo.
echo   Логи:      docker-compose logs -f
echo   Стоп:      docker-compose down
echo.
pause
