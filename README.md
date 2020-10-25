# Requirements
1. Cài đặt [MySQL](https://www.mysql.com/downloads/)
2. Cài đặt [Nodejs](https://nodejs.org/en/download/)
3. Cài đặt [Python](https://www.python.org/downloads/)
4. Cài đặt [Anaconda](https://docs.anaconda.com/anaconda/install/windows/)
# Packages installation
Trong thư mục backend:
```bash
pip install -r requirements.txt
```
Trong package django_fulltext_search vừa cài đặt, sửa dòng lệnh sau trong file django_fulltext_search.py:
```python
column = meta.get_field(field, many_to_many=False).column
```
thành: 
```python
column = meta.get_field(field).column
```
Trong thư mục frontend:
```bash
npm install
```
# Evironment config

Tạo file `backend\.env` có nội dung:
```text
DB_NAME=Tên_database
DB_USER=Tên_user_database
DB_PASSWORD=password_của_DB_USER
DB_HOST=host
DB_PORT=port
SENDGRID_API_KEY=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
DEFAULT_FROM_EMAIL=email_gửi
FRONTEND_URL=link_tới_frontend
RESET_PASSWORD_EXPIRE_SECOND=số_giây_hết_hạn_link_reset_password
```
Mặc định sau khi cài MySQL thì `DB_HOST=localhost` và `DB_PORT=3306`
FRONTEND_URL mặc định là `FRONTEND_URL=http://localhost:3000`

# Migrate database
Trong thư mục backend:
```bash
py manage.py makemigrations
py manage.py migrate
```

# Run server
Trong thư mục backend:
```bash
py manage.py runserver
```
Trong thư mục frontend:
```bash
npm start
```