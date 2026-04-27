import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, TopBar } from '@campaign-manager/ui';
import { ChevronDown, LogOut } from 'lucide-react';
import { loggedOut, useAppDispatch, useAppSelector } from '../store.js';

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const onLogout = () => {
    dispatch(loggedOut());
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="relative">
        <TopBar
          nav={[
            {
              label: 'Campaigns',
              href: '/',
              active: location.pathname === '/' || location.pathname.startsWith('/campaigns'),
            },
          ]}
        />
        {user && (
          <div className="absolute right-8 top-0 h-14 flex items-center">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-surface-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar name={user.name} />
                <ChevronDown className="h-3.5 w-3.5 text-fg-subtle" />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  sideOffset={6}
                  align="end"
                  className="z-50 min-w-[200px] rounded-md bg-surface border border-border p-1 shadow-soft text-fg"
                >
                  <div className="px-2.5 py-1.5">
                    <div className="text-[13px] font-medium truncate">{user.name}</div>
                    <div className="text-[12px] text-fg-muted truncate">{user.email}</div>
                  </div>
                  <DropdownMenu.Separator className="my-1 h-px bg-border" />
                  <DropdownMenu.Item
                    onSelect={onLogout}
                    className="px-2.5 py-1.5 text-[13px] rounded flex items-center gap-2 cursor-pointer outline-none data-[highlighted]:bg-surface-2"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        )}
      </div>
      <Outlet />
    </div>
  );
}
