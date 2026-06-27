import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bus, Clock, MapPin, Search, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { mockRoutes, mockStops } from '../data/mockData'
import { routeAPI, stopAPI } from '../api'

export default function HomePage() {
  const [routes, setRoutes] = useState([])
  const [stops, setStops] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRoute, setExpandedRoute] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const routesData = await routeAPI.getRoutes()
        setRoutes(routesData)
        
        const stopsData = await stopAPI.getStops()
        const stopsByRoute = {}
        stopsData.forEach(stop => {
          if (!stopsByRoute[stop.RouteID]) {
            stopsByRoute[stop.RouteID] = []
          }
          stopsByRoute[stop.RouteID].push(stop)
        })
        Object.keys(stopsByRoute).forEach(key => {
          stopsByRoute[key].sort((a, b) => a.OrderNum - b.OrderNum)
        })
        setStops(stopsByRoute)
      } catch (err) {
        setRoutes(mockRoutes)
        const allStops = {}
        Object.keys(mockStops).forEach(key => {
          allStops[key] = mockStops[key]
        })
        setStops(allStops)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredRoutes = routes.filter(route =>
    route.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.Description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const routeColors = [
    'from-blue-500 to-cyan-400',
    'from-emerald-500 to-teal-400',
    'from-purple-500 to-pink-400',
    'from-orange-500 to-amber-400',
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-hero bg-grid-pattern overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur rounded-full text-sm text-primary-600 font-medium mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse-soft" />
              实时更新 · 便捷查询
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              校园出行
              <span className="text-gradient"> 从此简单</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              查询巴士路线、时刻表和站点信息，让你的校园出行更加便捷高效
            </p>
            
            <div className="relative max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="搜索路线名称或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-lg shadow-primary-500/10 border border-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:shadow-xl focus:shadow-primary-500/20 transition-all duration-300 text-lg"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Link to="/schedules" className="btn-primary inline-flex items-center gap-2">
                <Clock className="w-5 h-5" />
                查看时刻表
              </Link>
              <a href="#routes" className="btn-secondary inline-flex items-center gap-2">
                浏览路线
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mt-16 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">
                {routes.length || 4}
              </div>
              <div className="text-sm text-gray-500">运营路线</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">
                {Object.values(stops).flat().length || 20}
              </div>
              <div className="text-sm text-gray-500">站点数量</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">
                50+
              </div>
              <div className="text-sm text-gray-500">每日班次</div>
            </div>
          </div>
        </div>
      </section>

      {/* Routes Section */}
      <section id="routes" className="flex-1 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              校园巴士路线
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              点击路线卡片查看详细站点信息，点击展开按钮了解更多
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRoutes.map((route, index) => (
                <div
                  key={route.ID}
                  className="card p-6 group cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setExpandedRoute(expandedRoute === route.ID ? null : route.ID)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${routeColors[index % routeColors.length]} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Bus className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                          {route.Name}
                        </h3>
                        <span className={`badge ${route.Status === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'} flex-shrink-0`}>
                          {route.Status === 1 ? '运行中' : '已停运'}
                        </span>
                      </div>
                      <p className="text-gray-500 mt-1 line-clamp-1">
                        {route.Description || '暂无描述'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {stops[route.ID]?.length || 0} 站
                      </span>
                      <Link
                        to={`/schedules?route_id=${route.ID}`}
                        className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Clock className="w-4 h-4" />
                        时刻表
                      </Link>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                      {expandedRoute === route.ID ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {expandedRoute === route.ID && stops[route.ID] && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-slide-down">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary-500" />
                        途经站点
                      </h4>
                      <div className="relative pl-6">
                        <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-500 via-primary-300 to-accent-400" />
                        {stops[route.ID].map((stop, idx) => (
                          <div key={stop.ID} className="relative py-2 last:pb-0">
                            <div className={`absolute -left-4 top-3 w-3 h-3 rounded-full border-2 border-white ${
                              idx === 0
                                ? 'bg-green-500 ring-2 ring-green-200'
                                : idx === stops[route.ID].length - 1
                                ? 'bg-red-500 ring-2 ring-red-200'
                                : 'bg-primary-400 ring-2 ring-primary-100'
                            }`} />
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                {stop.Name}
                              </span>
                              {idx === 0 && (
                                <span className="text-xs text-green-600 font-medium">起点</span>
                              )}
                              {idx === stops[route.ID].length - 1 && (
                                <span className="text-xs text-red-600 font-medium">终点</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && filteredRoutes.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">未找到相关路线</h3>
              <p className="text-gray-500">请尝试其他关键词搜索</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
