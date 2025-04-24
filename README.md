# Feedback System

A modern web application for collecting and managing feedback, built with React, Node.js, and Firebase.

## Features

- User Authentication (Sign In/Sign Up) with Firebase
- Feedback Collection and Management
- Admin Dashboard with Analytics
- Real-time updates
- Responsive Design with Tailwind CSS
- Excel Export Functionality
- RESTful API Backend

## Technologies Used

### Frontend
- React 18
- Vite
- Firebase (Authentication)
- Tailwind CSS
- React Router v6
- XLSX for Excel export

### Backend
- Node.js
- Express.js
- RESTful API Architecture
-Oracle Express 12c

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AlixSahil/Feedback-Application.git
cd Feedback-Application
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

4. Create a `.env` file in the root directory and add your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Start the development servers:
```bash
# Start backend server (in a separate terminal)
cd backend
npm start

# Start frontend development server (in another terminal)
npm run dev
```

6. Build for production:
```bash
npm run build
```

## Project Structure

```
Feedback-Application/
├── backend/           # Node.js backend server
│   ├── server.js     # Express server and API endpoints
│   └── package.json  # Backend dependencies
├── src/              # Frontend React application
│   ├── components/   # React components
│   ├── context/      # React context providers
│   ├── services/     # API and Firebase services
│   ├── firebase.js   # Firebase configuration
│   └── main.jsx      # Application entry point
├── public/           # Static assets
└── package.json      # Frontend dependencies
```

## API Endpoints

The backend provides the following RESTful endpoints:
- `GET /api/feedbacks` - Get all feedbacks
- `POST /api/feedbacks` - Create new feedback
- `DELETE /api/feedbacks/:id` - Delete feedback

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm start` - Start the backend server

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
