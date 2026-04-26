import * as React from 'react';
import { Bell, ChevronDown, Search } from 'lucide-react';
import { cn } from '../lib/cn';
import { Avatar } from './Avatar';

export interface NavItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface TopBarProps extends React.HTMLAttributes<HTMLDivElement> {
  appName?: string;
  /** Pre-rendered logo node. Defaults to small dark square. */
  logo?: React.ReactNode;
  nav?: NavItem[];
  user?: { name: string; src?: string };
  onSearchClick?: () => void;
  onNotificationsClick?: () => void;
}

const DefaultLogo = () => (
  <div className="h-6 w-6 rounded bg-fg flex items-center justify-center shrink-0">
    <div className="h-2 w-2 rounded-[2px] bg-bg" />
  </div>
);

/**
 * App-level top navigation bar. Sticky-ready (caller decides position).
 * Renders logo, nav, search/bell, avatar dropdown trigger.
 */
export const TopBar = React.forwardRef<HTMLDivElement, TopBarProps>(
  (
    { appName = 'Campaign Manager', logo, nav = [], user, onSearchClick, onNotificationsClick, className, ...props },
    ref
  ) => (
    <div ref={ref} className={cn('border-b border-border bg-surface', className)} {...props}>
      <div className="h-14 px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            {logo ?? <DefaultLogo />}
            <span className="font-semibold text-[14.5px] tracking-[-0.011em] text-fg">{appName}</span>
          </div>
          <nav className="flex items-center gap-1">
            {nav.map((item) => (
              <a
                key={item.label}
                href={item.href ?? '#'}
                className={cn(
                  'px-3 h-8 inline-flex items-center rounded-md text-[13.5px] transition-colors',
                  item.active
                    ? 'bg-surface-2 text-fg font-medium'
                    : 'text-fg-muted hover:bg-surface-2'
                )}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {onSearchClick && (
            <button
              type="button"
              onClick={onSearchClick}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md text-fg-subtle hover:bg-surface-2"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
          {onNotificationsClick && (
            <button
              type="button"
              onClick={onNotificationsClick}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md text-fg-subtle hover:bg-surface-2"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
          )}
          {user && (
            <>
              <div className="h-7 w-px bg-border" />
              <button
                type="button"
                className="flex items-center gap-2 h-8 pl-1 pr-2 rounded-md hover:bg-surface-2"
              >
                <Avatar name={user.name} src={user.src} size="md" />
                <span className="text-[13px] font-medium text-fg">{user.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-fg-subtle" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
);
TopBar.displayName = 'TopBar';
