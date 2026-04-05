# Деплой на Yandex Cloud

## Дата: 5 апреля 2026

---

## 1. Регистрация

1. Зайдите на [console.cloud.yandex.ru](https://console.cloud.yandex.ru)
2. Войдите через Яндекс-аккаунт
3. Привяжите карту (российские работают)
4. Получите грант **4000₽ на 60 дней** (новые аккаунты)

---

## 2. Установка YC CLI

### Windows
```powershell
# Скачайте установщик
curl -o yc-installer.ps1 https://storage.yandexcloud.net/yandexcloud-yc/install.ps1
.\yc-installer.ps1

# Добавьте в PATH
$env:PATH += ";$env:USERPROFILE\yandex-cloud\bin"
```

### Проверка
```powershell
yc --version
```

---

## 3. Инициализация

```powershell
yc init
```

Откроется браузер → авторизация → токен скопируется автоматически.

Выберите:
- **Cloud** → ваш облако
- **Folder** → default
- **Zone** → ru-central1-a

---

## 4. Создание виртуальной машины

### Через CLI
```powershell
yc compute instance create \
  --name habr-blog \
  --zone ru-central1-a \
  --platform standard-v1 \
  --cores 2 \
  --memory 2 \
  --create-boot-disk image-folder-id=standard-images,image-family=ubuntu-2204-lts,size=20,type=network-ssd \
  --public-ip \
  --ssh-key ~/.ssh/id_rsa.pub
```

### Через консоль
1. **Compute Cloud** → **Создать ВМ**
2. Параметры:
   - **Платформа**: Intel Cascade Lake (standard-v1)
   - **vCPU**: 2
   - **RAM**: 2 ГБ
   - **Диск**: 20 ГБ SSD
   - **ОС**: Ubuntu 22.04 LTS
   - **Публичный IP**: ✅ Включить
3. Запишите **публичный IP** (например, `84.201.123.45`)

---

## 5. Подключение к ВМ

### Через SSH
```powershell
# Создайте ключ если нет
ssh-keygen -t rsa -b 2048

# Подключитесь
ssh yc-user@<ВАШ_IP>
```

### Через веб-консоль
1. **Compute Cloud** → ваша ВМ → **Serial console**

---

## 6. Установка Docker на ВМ

```bash
# Обновление
sudo apt update && sudo apt upgrade -y

# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Docker Compose
sudo apt install docker-compose -y

# Проверка
docker --version
docker compose version
```

---

## 7. Загрузка проекта

### Вариант A: Git clone
```bash
git clone https://gitlab.com/your-username/your-repo.git
cd Habr
```

### Вариант B: SCP с локальной машины
```powershell
# С локальной машины (PowerShell)
scp -r C:\Users\Yar\Desktop\site\Habr yc-user@<ВАШ_IP>:~/Habr
```

---

## 8. Настройка окружения

```bash
cd ~/Habr

# Проверьте .env
cat .env
```

`.env` должен содержать:
```
SECRET_KEY=ваш-секретный-ключ
DEBUG=False
ALLOWED_HOSTS=<ВАШ_IP>,localhost,127.0.0.1,web
REDIS_URL=redis://redis:6379/1
```

---

## 9. Запуск

```bash
docker compose up --build -d
```

### Проверка
```bash
# Статус контейнеров
docker compose ps

# Логи бэкенда
docker compose logs web --tail=20

# Логи фронтенда
docker compose logs frontend --tail=20
```

### Тестовые данные
```bash
docker compose exec web python manage.py seed_articles
```

---

## 10. Открытие портов

Если не работает — откройте порты:

```bash
sudo ufw allow 3000
sudo ufw allow 8000
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

Или через консоль Yandex Cloud:
1. **Virtual Private Cloud** → **Security groups**
2. Добавьте правила:
   - **TCP 3000** — фронтенд
   - **TCP 8000** — бэкенд
   - **TCP 80** — HTTP
   - **TCP 443** — HTTPS

---

## 11. Доступ

| Сервис | URL |
|---|---|
| **Фронтенд** | `http://<ВАШ_IP>:3000` |
| **Бэкенд API** | `http://<ВАШ_IP>:8000/api/v1/` |
| **Django Admin** | `http://<ВАШ_IP>:8000/admin/` |

---

## 12. Домен (опционально)

### Покупка домена
1. **DNS** → **Регистрация доменов**
2. Выберите домен (~200₽/год для .ru)

### Настройка DNS
1. **DNS** → ваша зона → **Добавить запись**
   - **Тип**: A
   - **Имя**: @
   - **Значение**: `<ВАШ_IP>`
2. Подождите 15-60 минут

### Обновление ALLOWED_HOSTS
```bash
# В .env добавьте ваш домен
ALLOWED_HOSTS=your-domain.ru,<ВАШ_IP>,localhost,127.0.0.1,web

# Перезапуск
docker compose down
docker compose up -d
```

---

## 13. HTTPS (опционально)

```bash
# Установка Certbot
sudo apt install certbot -y

# Получение сертификата
sudo certbot certonly --standalone -d your-domain.ru

# Автообновление
sudo crontab -e
# Добавьте: 0 3 * * 1 certbot renew --quiet
```

---

## 14. Обновление проекта

```bash
cd ~/Habr
git pull
docker compose down
docker compose up --build -d
```

---

## 15. Мониторинг

```bash
# Логи
docker compose logs -f web
docker compose logs -f frontend

# Ресурсы
docker stats

# Состояние ВМ
free -h
df -h
top
```

---

## 16. Стоимость

| Ресурс | Цена/мес |
|---|---|
| ВМ (2 vCPU, 2 GB RAM) | ~600₽ |
| Диск 20 ГБ SSD | ~150₽ |
| Публичный IP | ~150₽ |
| Домен .ru | ~20₽ |
| **Итого** | **~920₽/мес** |

С грантом 4000₽ — **~4 месяца бесплатно**.

---

## 17. Troubleshooting

### Контейнер не запускается
```bash
docker compose logs <сервис>
docker compose ps
```

### Нет доступа по IP
```bash
sudo ufw status
sudo ufw allow 3000
sudo ufw allow 8000
```

### Мало места
```bash
# Очистка Docker
docker system prune -af

# Проверка диска
df -h
```

### Бэкенд не отвечает
```bash
docker compose exec web python manage.py check
docker compose exec web python manage.py showmigrations
```

### Фронтенд не видит API
```bash
# Проверьте .env в frontend/
cat frontend/.env
# Должно быть: VITE_API_URL=http://localhost:8000/api/v1

# Пересоберите
docker compose down
docker compose up --build -d
```

---

## 18. Команды

```bash
# Запуск
docker compose up --build -d

# Остановка
docker compose down

# Логи
docker compose logs -f

# Миграции
docker compose exec web python manage.py migrate

# Суперпользователь
docker compose exec web python manage.py createsuperuser

# Тестовые данные
docker compose exec web python manage.py seed_articles

# Перезапуск
docker compose restart

# Обновление
git pull && docker compose down && docker compose up --build -d
```
