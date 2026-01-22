'use client'

import { ThemeToggle } from '@/components/theme-toggle'

export function Navbar() {
  return (
    <nav className="fixed top-0 right-0 p-4 z-50">
      <ThemeToggle />
    </nav>
  )
}
