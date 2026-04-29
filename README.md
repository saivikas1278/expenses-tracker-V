# Expense Tracker

A MERN stack expense tracker with a Node.js/Express backend and a React frontend built with Vite and Tailwind CSS.

## Project Structure

```text
expense-tracker/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── package.json
│   └── server.js
├── .gitignore
└── README.md
```

## Getting Started

### Server

```bash
cd server
npm install
npm run dev
```

### Client

```bash
cd client
npm install
npm run dev
```

## Notes

- The backend is set up to expose a basic Express server entry point.
- The frontend is set up for React, Vite, and Tailwind CSS.
- Add your MongoDB connection, routes, controllers, and React features as you build the app.
