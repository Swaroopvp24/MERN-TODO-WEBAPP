
# 📝 MERN Stack Todo Application

A full-stack **Todo List Application** built for the **5th Semester Backend Mini Project**.  
This app includes **user authentication**, **task management**, **date/time scheduling**, and a fully responsive UI.

---

## 🚀 Features

- 🔐 **Authentication**
  - Secure **JWT-based Login & Registration**
- 📝 **Task Management**
  - Create, Read, Update, Delete (CRUD)
  - Add **descriptions**, **dates**, **times**, and **all-day tasks**
- ⚠️ **Validation**
  - Prevents adding tasks scheduled in the past
- 📱 **Responsive Design**
  - Built using **Tailwind CSS**
- 💾 **Data Persistence**
  - All user data stored securely in **MongoDB**

---

## 🛠️ Tech Stack

### **Frontend**
- React (Vite)
- Tailwind CSS
- Lucide React (Icons)

### **Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT (Authentication)
- BcryptJS (Password Hashing)

---

## 📂 Project Structure

```

5TH SEM BACKEND MINI/
├── backend/              # Server, Models, Routes, Controllers
│   ├── models.js         # Database Schemas
│   ├── routes.js         # API Endpoints
│   ├── server.js         # Entry Point
│   └── ...
└── frontend/             # React Application
├── src/              # UI Components & Logic
└── ...

````

---

## ⚙️ Setup & Installation

### **Prerequisites**
✔ Node.js installed  
✔ MongoDB installed & running locally *(or use MongoDB Atlas)*  

---

## 🔧 1. Backend Setup

Open a terminal inside the **backend** folder.

### **Install dependencies:**
```bash
npm install
````

### **Create a `.env` file** inside the backend folder with the following:

```
MONGO_URI=<yourmongourltodatabase>
JWT_SECRET=mysecretkey123(can be anything of your choice)
PORT=5000
```

### **Start the server:**

```bash
npm start
```

---

## 🎨 2. Frontend Setup

Open a new terminal inside the **frontend** folder.

### **Install dependencies:**

```bash
npm install
```

### **Start the React app:**

```bash
npm run dev
```

Then open the link shown in the terminal
➡ usually: **[http://localhost:5173](http://localhost:5173)**

---

## 🔗 API Endpoints

| Method | Endpoint         | Description         |
| ------ | ---------------- | ------------------- |
| POST   | `/api/register`  | Register a new user |
| POST   | `/api/login`     | Login & receive JWT |
| GET    | `/api/todos`     | Fetch all tasks     |
| POST   | `/api/todos`     | Create a task       |
| PUT    | `/api/todos/:id` | Update/Edit a task  |
| DELETE | `/api/todos/:id` | Delete a task       |

---

## 🤝 Contributing

Feel free to **fork** this repository and submit a **pull request** with improvements.

---

## 📜 License

This project is intended for **educational purposes**.

---
