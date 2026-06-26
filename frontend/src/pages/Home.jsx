import { Link } from 'react-router-dom'
import { Bus, MapPin, Clock, ArrowRight, Search, Users, ShieldCheck, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { routeAPI } from '../services/api'

export default function Home() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const data = await routeAPI.getRoutes()
        setRoutes(data || [])
      } catch (err) {
        console.error('获取路线失败:', err)
        setRoutes([
          { id: 1, name: 'A校区-图书馆专线', description: '连接A校区主教学楼与图书馆', status: 1 },
          { id: 2, name: '东区-西区环线', description: '环绕东西两区的循环线路', status: 1 },
          { id: 3, name: '南门-地铁口快线', description: '快速直达地铁站', status: 1 },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchRoutes()
  }, [])

  const features = [
    { icon: Zap, title: '实时查询', desc: '随时掌握巴士动态，出行无忧' },
    { icon: MapPin, title: '精准定位', desc: '站点位置一目了然，不再迷路' },
    { icon: Clock, title: '准时可靠', desc: '严格按照时刻表运行，守时守信' },
    { icon: ShieldCheck, title: '安全保障', desc: '专业司机驾驶，全程安全护航' },
  ]

  return (
    <div className="space-y-16">
      <section className="text-center py-16 md:py-24">
        <div className="animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-btn mb-6 bus-animation">
            <Bus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">校园巴士系统</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            便捷、高效、绿色的校园出行方式。让你的校园生活更加轻松愉快！
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/routes"
              className="gradient-btn text-white px-8 py-3 rounded-full font-medium text-lg inline-flex items-center justify-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>查询路线</span>
            </Link>
            <Link
              to="/schedules"
              className="glass-card px-8 py-3 rounded-full font-medium text-lg text-gray-700 hover:bg-white/80 transition-all inline-flex items-center justify-center space-x-2"
            >
              <Clock className="w-5 h-5" />
              <span>查看时刻表</span>
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-center mb-12 gradient-text">特色功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300"
            >
              <div className="w-14 h-14 rounded-xl gradient-btn flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold gradient-text">热门线路</h2>
          <Link
            to="/routes"
            className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center space-x-1"
          >
            <span>查看全部</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-500">加载中...</div>
          ) : (
            routes.slice(0, 3).map((route) => (
              <div
                key={route.id}
                className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <Bus className="w-6 h-6 text-white" />
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      route.status === 1
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {route.status === 1 ? '运行中' : '已停运'}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-primary-600 transition-colors">
                  {route.name}
                </h3>
                <p className="text-gray-600 mb-4">{route.description}</p>
                <Link
                  to="/routes"
                  className="text-primary-600 font-medium inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform"
                >
                  <span>查看详情</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="glass-card rounded-3xl p-8 md:p-12">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-primary-500" />
          <h2 className="text-3xl font-bold mb-4 gradient-text">加入我们，开启便捷校园生活</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            立即注册账号，享受更多专属服务。实时提醒、定制路线，让校园出行更智能。
          </p>
          <Link
            to="/login"
            className="gradient-btn text-white px-10 py-4 rounded-full font-medium text-lg inline-flex items-center space-x-2"
          >
            <Users className="w-5 h-5" />
            <span>立即登录/注册</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
