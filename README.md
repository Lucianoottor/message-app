<h2> Project Name : Message App with WebSocket and JWT authentication </h2>

![](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

<img src ="./assets/bg-3.webp" width="80%">

</div>

## 💡 Overview

The Message App is a project developed for real time exchange of messages. It has multiple technologies for authentication, exchanging of messages using socket and API development for CRUD.

## ✨ Features

- **🔐 User Authentication:** Secure login with JWT Token and expiring token.
- **🌎 Chat rooms:** Chat rooms using socket.io to exchange messages safely.
- **📄 Databases:** CRUD technology using MySQL and sequelize to store password hashes, conversation messages and more.
- **🔍 Creating messages and filtering users:** Create message as groups or individuals and search for the users you want to assign.
- **🖥️ API Restful:** Rest APIs developed to manage conversations, users, chatrooms and others.
- **❗ Disclaimer:** In the backend, Im not using .env file to setup variables so people can check on passwords, ports and etc., however in a real project it's higly recommended to do so and do not save confidential variables in the code.


**🛠️ Tech Stack**

**React:** A JavaScript library for building dynamic and responsive user interfaces.
**Node.js:** A back-end JavaScript runtime environment used to build the server-side application.
**Express.js:** A minimal and flexible Node.js web application framework used for building the RESTful API.
**Socket.IO:** A library that enables real-time, bidirectional and event-based communication for the chat functionality.
**Sequelize:** A modern Node.js ORM (Object-Relational Mapper) for managing the MySQL database with models and associations.
**MySQL:** An open-source relational database used for data persistence.
**Bcrypt:** A password hashing function designed to securely store passwords by converting them into an irreversible, unique code.
**JSON Web Tokens (JWT):** An open standard for securely creating access tokens, used for user authentication and session management.
**Tailwind CSS:** A utility-first CSS framework for rapidly building custom user interfaces.


## 📦 Getting Started

To get a local copy of this project up and running, follow these steps.

### 🚀 Prerequisites

- **Node.js** (v18.x)
- **Npm** If you prefer using npm for package management and running scripts.
- **MySQL** (or another supported SQL database).

## 🛠️ Installation and Execution

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Lucianoottor/message-app.git](https://github.com/Lucianoottor/message-app.git)
   
2. **Install backend dependencies:**
   ```bash
   cd message-app/backend
   npm install
3. **Run the app and server in two distinct instances:**
   ```bash
   cd message-app/backend
   node app.js
   node server.js
4. **Run the frontend:**
   ```bash
   cd message-app/frontend
   npm start

