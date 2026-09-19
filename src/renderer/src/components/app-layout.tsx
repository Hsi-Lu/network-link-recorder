import { Link, NavLink, Outlet } from 'react-router'
import { Cable, Cpu, LayoutGrid, Network, Server } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { to: '/links', label: 'Links', icon: Cable },
  { to: '/rooms', label: 'Rooms', icon: LayoutGrid },
  { to: '/racks', label: 'Racks', icon: Server },
  { to: '/devices', label: 'Devices', icon: Cpu },
  { to: '/interfaces', label: 'Interfaces', icon: Network }
]

export function AppLayout() {
  return (
    <div className="flex h-full min-h-0">
      <aside className="flex w-56 shrink-0 flex-col border-r bg-card">
        <Link to="/links" className="border-b px-4 py-4 text-sm font-semibold tracking-tight">
          Network Link Recorder
        </Link>
        <nav className="flex flex-col gap-1 p-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent',
                  isActive && 'bg-accent font-medium'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
