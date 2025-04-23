# Feedback System

A modern web application for collecting and managing feedback, built with React and Firebase.

## Features

- User Authentication (Sign In/Sign Up)
- Feedback Collection
- Admin Dashboard
- Real-time updates
- Responsive Design

## Technologies Used

- React 18
- Vite
- Firebase (Authentication & Database)
- Tailwind CSS
- React Router v6

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

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/         # React components
│   ├── AdminDashboard.jsx
│   ├── Auth.jsx
│   └── FeedbackCollection.jsx
├── context/           # React context
│   └── AuthContext.jsx
├── firebase.js        # Firebase configuration
└── main.jsx          # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
