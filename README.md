# Email Notification System – Backend API

This repository contains the **backend API** for the Email Notification System. It is responsible for authentication, organization management, email delivery, notification history, and admin-level operations.

🔗 **Live API URL**: [https://email-notification-system-api.vercel.app/](https://email-notification-system-api.vercel.app/)

---

## 🚀 Overview

A **backend-focused, queue-based email notification API** supporting **immediate and scheduled email delivery**.

Email requests are pushed into a **queue** and processed asynchronously by **cron-based workers**, sending emails in a **controlled, rate-limited manner** to avoid SMTP (Gmail) limits. The system is **multi-tenant**, secure, and designed to work across **serverless and Docker-based deployments**.

---

## 🧩 Core Features

* Queue-based email processing for reliable and scalable delivery
* Support for **immediate and scheduled emails**
* Cron-based workers to process email queues asynchronously
* Rate-limited email sending to avoid SMTP (Gmail) provider limits
* Secure REST APIs for email notifications
* JWT-based authentication with role-based access (Admin & Organization)
* Secure Gmail App Password credential management
* Complete email notification history tracking
* Admin-level monitoring and management

---

## 🛠️ Tech Stack

* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: MongoDB
* **Email Service**: Nodemailer (Gmail SMTP)
* **Authentication**: JWT
* **Scheduler**: node-cron
* **Deployment**: Vercel (Serverless)
* **Containerization**: Docker

---

## 📡 API Usage

This backend exposes REST APIs that allow organizations to:

* Authenticate using API keys / tokens
* Send transactional or notification emails
* Track delivery attempts

📌 Full API documentation can be found in the codebase or frontend integration.

---

## 🔐 Email Credential Setup

To successfully send emails:

1. Use a valid **Gmail account**
2. Enable **2-Step Verification** in Google Account
3. Generate a **Google App Password**
4. Save the email ID and app password using the API

⚠️ Normal Gmail passwords will **not work**.

## ▶️ Run Locally

```bash
git clone https://github.com/sourav-18/email-notification-system-api.git
cd email-notification-system-api
cp example.env .env
npm install
npm run dev
```

Server will start on:

```
http://localhost:5000
```

---

## 🐳 Docker Configuration

This project includes a Dockerfile for containerized deployment.

### Build Docker Image

```bash
docker build -t email-notification-system-api .
```

### Run Docker Container

```bash
docker run -p 5000:5000 --env-file .env email-notification-system-api
```

📌 Make sure MongoDB is accessible from inside the container.

---

## ⏱️ Cron Job Disclaimer

⚠️ **Important Notice**

This project uses **cron jobs (node-cron)** for scheduled tasks.

On the **live production URL**, cron jobs may **not work reliably** because:

* The backend is hosted on **Vercel Free Tier**
* Vercel uses a **serverless architecture**
* Serverless functions do not stay alive continuously

✅ Cron jobs work correctly in:

* Local development
* Docker-based deployment
* Traditional VM / container-based hosting

---

## 🔒 Security Practices

* Passwords are hashed before storage
* App passwords are never exposed to clients
* JWT-based authentication
* Role-based access control (Admin / Organization)

---

## 🔗 Related Repositories

* **Frontend Repository**: [https://github.com/sourav-18/email-notification-system-client](https://github.com/sourav-18/email-notification-system-client)
* **Live Frontend**: [https://email-notification-system-client-i9.vercel.app/login](https://email-notification-system-client-i9.vercel.app/login)

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Sourav**
Backend Developer | Node.js & System Design Enthusiast

If this project helped you, please ⭐ the repository!
