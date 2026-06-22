import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/Dashboard/DashboardPage';
import BooksPage from './pages/Books/BooksPage';
import MembersPage from './pages/Members/MembersPage';
import IssuancesPage from './pages/Issuances/IssuancesPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import { ROUTES } from './constants/routes';

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <Routes>
          <Route path={ROUTES.HOME} element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path={ROUTES.BOOKS} element={<BooksPage />} />
            <Route path={ROUTES.MEMBERS} element={<MembersPage />} />
            <Route path={ROUTES.ISSUANCES} element={<IssuancesPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </NotificationProvider>
    </BrowserRouter>
  );
}