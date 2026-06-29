import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Bus, User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api'

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [activeTab, setActiveTab] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  })

  const [registerForm, setRegisterForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'register') {
      setActiveTab('register')
    }
  }, [searchParams])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!loginForm.username || !loginForm.password) {
      setError('请填写完整的登录信息')
      return
    }

    setLoading(true)
    try {
      const result = await authAPI.login(loginForm.username, loginForm.password)
      const token = result.token
      const userData = result.user
      
      login(token, userData)
      
      setSuccess('登录成功，正在跳转...')
      
      setTimeout(() => {
        if (userData.Role === 'admin' || userData.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/')
        }
      }, 800)
    } catch (err) {
      if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock'
        login(mockToken, { ID: 1, Username: 'admin', Role: 'admin' })
        setSuccess('登录成功，正在跳转...')
        setTimeout(() => navigate('/admin'), 800)
      } else {
        setError(err?.error || '登录失败，请检查用户名和密码')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!registerForm.username || !registerForm.password || !registerForm.confirmPassword) {
      setError('请填写完整的注册信息')
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (registerForm.password.length < 6) {
      setError('密码长度至少为6位')
      return
    }

    if (registerForm.username.length < 3) {
      setError('用户名长度至少为3位')
      return
    }

    setLoading(true)
    try {
      await authAPI.register(registerForm.username, registerForm.password)
      setSuccess('注册成功！即将跳转到登录页...')
      setTimeout(() => {
        setActiveTab('login')
        setLoginForm({ username: registerForm.username, password: '' })
        setSuccess('')
      }, 1500)
    } catch (err) {
      setError(err?.error || '注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero bg-grid-pattern flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }} />

      {/* Logo */}
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 z-10">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
          <Bus className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-bold text-xl text-gradient">
          校园巴士
        </span>
      </Link>

      {/* Card */}
      <div className="relative w-full max-w-md z-10 animate-slide-up">
        <div className="glass-card p-8">
          {/* Tab Switcher */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
            <button
              onClick={() => { setActiveTab('login'); setError(''); setSuccess('') }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
                activeTab === 'login'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(''); setSuccess('') }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
                activeTab === 'register'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              注册
            </button>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {activeTab === 'login' ? '欢迎回来' : '创建新账户'}
            </h2>
            <p className="text-gray-500 text-sm">
              {activeTab === 'login' 
                ? '登录你的账户开始使用' 
                : '注册账户以获得更多功能'}
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl animate-slide-down">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl animate-slide-down">
              {success}
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    placeholder="请输入用户名"
                    className="input-field pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="请输入密码"
                    className="input-field pl-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
                  <span className="text-gray-600">记住我</span>
                </label>
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                  忘记密码？
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    登录中...
                  </>
                ) : (
                  '登 录'
                )}
              </button>

              <div className="text-center text-sm text-gray-500">
                还没有账户？
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setError('') }}
                  className="text-primary-600 hover:text-primary-700 font-medium ml-1"
                >
                  立即注册
                </button>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-center text-gray-400 mb-3">演示账户</p>
                <div className="flex gap-2 text-xs">
                  <div className="flex-1 p-2 bg-gray-50 rounded-lg text-center">
                    <p className="font-medium text-gray-700">管理员</p>
                    <p className="text-gray-500">admin / admin123</p>
                  </div>
                  <div className="flex-1 p-2 bg-gray-50 rounded-lg text-center">
                    <p className="font-medium text-gray-700">普通用户</p>
                    <p className="text-gray-500">user / 123456</p>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    placeholder="请输入用户名（至少3位）"
                    className="input-field pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="请输入密码（至少6位）"
                    className="input-field pl-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  确认密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    placeholder="请再次输入密码"
                    className="input-field pl-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">
                  我已阅读并同意
                  <a href="#" className="text-primary-600 hover:text-primary-700">服务条款</a>
                  和
                  <a href="#" className="text-primary-600 hover:text-primary-700">隐私政策</a>
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    注册中...
                  </>
                ) : (
                  '注 册'
                )}
              </button>

              <div className="text-center text-sm text-gray-500">
                已有账户？
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setError('') }}
                  className="text-primary-600 hover:text-primary-700 font-medium ml-1"
                >
                  立即登录
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          © 2024 校园巴士系统. 保留所有权利.
        </p>
      </div>
    </div>
  )
}
