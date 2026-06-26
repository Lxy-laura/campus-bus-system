import Navbar from './Navbar'
import { Bus } from 'lucide-react'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">{children}</div>
      </main>
      <footer className="glass-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full gradient-btn flex items-center justify-center">
                <Bus className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold gradient-text">校园巴士系统</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 校园巴士系统. 让出行更便捷
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
