'use client';
import { useSidebar } from 'fumadocs-ui/provider';
import { type ButtonHTMLAttributes, type HTMLAttributes } from 'react';
import { useNav } from '../layout/nav';
import { cn } from '../../lib/cn';
import { SidebarTrigger } from 'fumadocs-core/sidebar';
import { buttonVariants } from '../ui/button';
import { Menu, X } from 'lucide-react';

export function Navbar(props: HTMLAttributes<HTMLElement>) {
  const { open } = useSidebar();
  const { isTransparent } = useNav();

  return (
    <header
      {...props}
      className={cn(
        'sticky top-[var(--fd-banner-height)] z-30 flex flex-row items-center border-b border-fd-foreground/10 px-4 backdrop-blur-lg transition-colors',
        (!isTransparent || open) && 'bg-fd-background/80',
        props.className,
      )}
    >
      {props.children}
    </header>
  );
}

export function NavbarSidebarTrigger(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  const { open } = useSidebar();

  return (
    <SidebarTrigger
      {...props}
      className={cn(
        buttonVariants({
          color: 'ghost',
          size: 'icon',
        }),
        props.className,
      )}
    >
      {open ? <X /> : <Menu />}
    </SidebarTrigger>
  );
}
