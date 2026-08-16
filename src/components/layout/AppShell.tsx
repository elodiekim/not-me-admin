import { NavLink, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard' },
  { to: '/missions', label: 'Missions' },
  { to: '/users', label: 'Users' },
  { to: '/statistics', label: 'Statistics' },
];

export function AppShell() {
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-svh">
      <aside className="w-56 shrink-0 border-r bg-sidebar text-sidebar-foreground">
        <div className="px-4 py-4 text-sm font-semibold">NotMe Admin</div>
        <nav className="flex flex-col gap-1 px-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end border-b px-6 py-3">
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            Log Out
          </Button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
