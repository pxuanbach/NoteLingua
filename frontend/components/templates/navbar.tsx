'use client';

import Link from 'next/link';
import { Button } from './button';
import { logoutAction } from '@/lib/actions/auth';
import { User } from '@/types';

interface NavbarProps {
  user?: User | null;
}

export function Navbar({ user }: NavbarProps) {
  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold">
              NoteLingua
            </Link>

            {user && (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/home"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/vocabularies"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Vocabularies
                </Link>
                <Link
                  href="/imports"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Documents
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  Welcome, {user.firstName}!
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
