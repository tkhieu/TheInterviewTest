import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage.js';
import { CampaignListPage } from './pages/CampaignListPage.js';
import { CampaignNewPage } from './pages/CampaignNewPage.js';
import { CampaignDetailPage } from './pages/CampaignDetailPage.js';
import { AppShell } from './components/AppShell.js';
import { RequireAuth } from './components/RequireAuth.js';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/" element={<CampaignListPage />} />
          <Route path="/campaigns/new" element={<CampaignNewPage />} />
          <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
