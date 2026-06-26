import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Bus, Calendar, Home, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = [
    { path: '/', label: '首页', icon: Home },
    { path: '/schedules', label: '时刻表', icon: Calendar },
    { path: '/routes', label: '路线查询', icon: Bus },
  ]

  return (
    <nav className="glass-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full gradient-btn flex items-center justify-center">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">校园巴士</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'text-primary-600 bg-primary-50 font-semibold'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`
                }
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-700">
                  <div className="w-8 h-8 rounded-full gradient-btn flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>退出</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="gradient-btn text-white px-6 py-2 rounded-full font-medium"
              >
                登录
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'text-primary-600 bg-primary-50 font-semibold'
                        : 'text-gray-600 hover:bg-primary-50'
                    }`
                  }
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </NavLink>
              ))}
              <div className="border-t pt-2 mt-2">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>退出登录</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block text-center gradient-btn text-white px-6 py-3 rounded-lg font-medium"
                  >
                    登录
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
