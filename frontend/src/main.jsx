import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App.jsx';

// Create a simple router that mounts the existing App component at the root.
// We opt-in early to the v7_startTransition future flag to silence the console warning
// about React Router's upcoming behavior change.
const router = createBrowserRouter([
  { path: '/*', element: <App /> },
], {
  future: { v7_startTransition: true },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      {/* Also pass the future flag to RouterProvider as a prop to ensure the opt-in is recognized */}
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </GoogleOAuthProvider>
  </StrictMode>
);
