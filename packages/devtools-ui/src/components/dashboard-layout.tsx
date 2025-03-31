import type React from 'react';

import { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
  Bot,
  Command,
  Server,
  Globe,
  Activity,
  Bug,
  Layers,
  BarChart,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/', icon: BarChart },
    { name: 'Commands', href: '/commands', icon: Command },
    { name: 'Events', href: '/events', icon: Activity },
    { name: 'Servers', href: '/servers', icon: Server },
    { name: 'Localization', href: '/localization', icon: Globe },
    { name: 'Performance', href: '/performance', icon: Activity },
    { name: 'Debugging', href: '/debugging', icon: Bug },
    { name: 'Middleware', href: '/middleware', icon: Layers },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-300 ease-in-out md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center">
            <img
              src="/ckit_logo.png"
              alt="CommandKit Logo"
              className="h-8 select-none"
              draggable={false}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="mt-5 px-2">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                {/* eslint-disable-next-line */}
                {/* @ts-ignore */}
                <Link
                  href={item.href}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden w-64 flex-shrink-0 border-r border-border bg-background md:block">
        <div className="flex h-16 items-center border-b border-border px-4">
          <img
            src="/ckit_logo.png"
            alt="CommandKit Logo"
            className="h-8 select-none"
            draggable={false}
          />
        </div>
        <nav className="mt-5 px-2">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                {/* eslint-disable-next-line */}
                {/* @ts-ignore */}
                <Link
                  href={item.href}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 border-t border-border p-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-16 items-center justify-between border-b border-border px-4 md:px-6">
          <div className="flex items-center">
            <button
              type="button"
              className="text-foreground focus:outline-none md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <h1 className="ml-2 text-xl font-semibold md:ml-0">
              {navigation.find((item) => item.href === pathname)?.name ||
                'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center">
            <Button variant="outline" size="sm">
              <Bot className="mr-2 h-4 w-4" />
              My Bot
            </Button>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto bg-muted/40 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
