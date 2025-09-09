import './globals.css'
import { Toaster } from "@/components/ui/sonner"

export const metadata = {
  title: 'FitTracker - Your Personal Fitness Companion',
  description: 'Track workouts, set fitness goals, monitor progress, and stay motivated on your fitness journey',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}