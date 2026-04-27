import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from '@campaign-manager/ui';
import { useAppSelector } from '../store.js';

export function AppShell() {
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <TopBar
        nav={[
          {
            label: 'Campaigns',
            href: '/',
            active: location.pathname === '/' || location.pathname.startsWith('/campaigns'),
          },
        ]}
        user={user ? { name: user.name } : undefined}
      />
      <Outlet />
    </div>
  );
}
