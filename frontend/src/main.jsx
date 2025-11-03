import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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
    {/* Also pass the future flag to RouterProvider as a prop to ensure the opt-in is recognized */}
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  </StrictMode>
);
