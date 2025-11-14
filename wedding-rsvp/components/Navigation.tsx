'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) {
    // Admin Navigation
    return (
      <nav className="border-b border-bronze-200 bg-ivory-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-serif text-mahogany-800 hover:text-mahogany-600">
              Wedding RSVP
            </Link>
            <div className="flex items-center gap-6">
              <Link 
                href="/admin" 
                className={`text-sm transition-colors ${
                  pathname === '/admin' 
                    ? 'text-mahogany-600 font-semibold' 
                    : 'text-bronze-700 hover:text-mahogany-600'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/admin/hotels" 
                className={`text-sm transition-colors ${
                  pathname === '/admin/hotels' 
                    ? 'text-mahogany-600 font-semibold' 
                    : 'text-bronze-700 hover:text-mahogany-600'
                }`}
              >
                Hotels
              </Link>
              <Link 
                href="/admin/phone-whitelist" 
                className={`text-sm transition-colors ${
                  pathname === '/admin/phone-whitelist' 
                    ? 'text-mahogany-600 font-semibold' 
                    : 'text-bronze-700 hover:text-mahogany-600'
                }`}
              >
                Phone Whitelist
              </Link>
              <Link 
                href="/" 
                className="text-sm text-bronze-600 hover:text-mahogany-600 transition-colors"
              >
                ← Back to Site
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Public Navigation
  return (
    <nav className="border-b border-bronze-200 bg-ivory-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-serif text-mahogany-800 hover:text-mahogany-600">
          🤎 B&D
          </Link>
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className={`text-sm transition-colors ${
                pathname === '/' 
                  ? 'text-mahogany-600 font-semibold' 
                  : 'text-bronze-700 hover:text-mahogany-600'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/rsvp" 
              className={`text-sm transition-colors ${
                pathname === '/rsvp' 
                  ? 'text-mahogany-600 font-semibold' 
                  : 'text-bronze-700 hover:text-mahogany-600'
              }`}
            >
              RSVP
            </Link>
            <Link 
              href="/travel" 
              className={`text-sm transition-colors ${
                pathname === '/travel' 
                  ? 'text-mahogany-600 font-semibold' 
                  : 'text-bronze-700 hover:text-mahogany-600'
              }`}
            >
              Travel
            </Link>
            <Link 
              href="/faq" 
              className={`text-sm transition-colors ${
                pathname === '/faq' 
                  ? 'text-mahogany-600 font-semibold' 
                  : 'text-bronze-700 hover:text-mahogany-600'
              }`}
            >
              FAQ
            </Link>
            <Link 
              href="/profile" 
              className={`text-sm transition-colors ${
                pathname === '/profile' 
                  ? 'text-mahogany-600 font-semibold' 
                  : 'text-bronze-700 hover:text-mahogany-600'
              }`}
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}