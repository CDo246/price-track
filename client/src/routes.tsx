import { createBrowserRouter } from 'react-router-dom';
import { MainPage } from './pages/main';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
  },
]);