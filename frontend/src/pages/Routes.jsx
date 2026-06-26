import { useState, useEffect } from 'react'
import { Search, Bus, MapPin, Clock, ChevronRight, Navigation } from 'lucide-react'
import { routeAPI, stopAPI } from '../services/api'

export default function Routes() {
  const [routes, setRoutes] = useState([])
  const [stops, setStops] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesData, stopsData] = await Promise.all([
          routeAPI.getRoutes(),
          stopAPI.getStops(),
        ])
        setRoutes(routesData || [])
        setStops(stopsData || [])
      } catch (err) {
        console.error('获取数据失败:', err)
        setRoutes([
          { id: 1, name: 'A校区-图书馆专线', description: '连接A校区主教学楼与图书馆，途径食堂、体育馆', status: 1 },
          { id: 2, name: '东区-西区环线', description: '环绕东西两区的循环线路，途径主要教学楼', status: 1 },
          { id: 3, name: '南门-地铁口快线', description: '快速直达地铁站，中途仅停靠重要站点', status: 1 },
          { id: 4, name: '北门-商业街专线', description: '连接北门与校外商业街，方便师生出行', status: 1 },
          { id: 5, name: '新生校区-本部直达', description: '新生校区与本部之间的直达快线', status: 0 },
        ])
        setStops([
          { id: 1, route_id: 1, name: 'A校区东门', order_num: 1 },
          { id: 2, route_id: 1, name: '主教学楼', order_num: 2 },
          { id: 3, route_id: 1, name: '第一食堂', order_num: 3 },
          { id: 4, route_id: 1, name: '体育馆', order_num: 4 },
          { id: 5, route_id: 1, name: '图书馆', order_num: 5 },
          { id: 6, route_id: 2, name: '东区宿舍', order_num: 1 },
          { id: 7, route_id: 2, name: '东区教学楼', order_num: 2 },
          { id: 8, route_id: 2, name: '中心广场', order_num: 3 },
          { id: 9, route_id: 2, name: '西区实验楼', order_num: 4 },
          { id: 10, route_id: 2, name: '西区宿舍', order_num: 5 },
          { id: 11, route_id: 3, name: '南门', order_num: 1 },
          { id: 12, route_id: 3, name: '行政楼', order_num: 2 },
          { id: 13, route_id: 3, name: '地铁口', order_num: 3 },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredRoutes = routes.filter(
    (route) =>
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRouteStops = (routeId) => {
    return stops
      .filter((stop) => stop.route_id === routeId)
      .sort((a, b) => a.order_num - b.order_num)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 gradient-text">路线查询</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          搜索校园巴士路线，查看详细站点信息，规划你的出行路线
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索路线名称或描述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all bg-white/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Bus className="w-5 h-5 text-primary-500" />
            <span>所有路线</span>
          </h2>
          {loading ? (
            <div className="glass-card rounded-xl p-8 text-center text-gray-500">
              加载中...
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {filteredRoutes.length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center text-gray-500">
                  没有找到相关路线
                </div>
              ) : (
                filteredRoutes.map((route) => (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`glass-card rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                      selectedRoute?.id === route.id
                        ? 'ring-2 ring-primary-500 bg-primary-50/50'
                        : 'hover:shadow-md hover:translate-x-1'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{route.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{route.description}</p>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          selectedRoute?.id === route.id ? 'text-primary-500 rotate-90' : ''
                        }`}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-gray-500 flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{getRouteStops(route.id).length} 个站点</span>
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          route.status === 1
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {route.status === 1 ? '运行中' : '已停运'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedRoute ? (
            <div className="glass-card rounded-2xl p-6 animate-fade-in">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedRoute.name}</h2>
                  <p className="text-gray-600">{selectedRoute.description}</p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full font-medium ${
                    selectedRoute.status === 1
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {selectedRoute.status === 1 ? '运行中' : '已停运'}
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-primary-500" />
                  <span>途经站点</span>
                </h3>
                <div className="relative">
                  {getRouteStops(selectedRoute.id).map((stop, index) => {
                    const routeStops = getRouteStops(selectedRoute.id)
                    const isFirst = index === 0
                    const isLast = index === routeStops.length - 1
                    return (
                      <div key={stop.id} className="flex items-start">
                        <div className="flex flex-col items-center mr-4">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                              isFirst
                                ? 'bg-green-500'
                                : isLast
                                ? 'bg-red-500'
                                : 'bg-primary-500'
                            }`}
                          >
                            {isFirst || isLast ? (
                              <Navigation className="w-3 h-3 text-white" />
                            ) : (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          {!isLast && (
                            <div className="w-0.5 h-12 bg-gray-200" />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <h4 className="font-medium text-gray-800">{stop.name}</h4>
                          <p className="text-sm text-gray-500">
                            第 {stop.order_num} 站
                            {isFirst && ' · 起点站'}
                            {isLast && ' · 终点站'}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 rounded-xl p-4 text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-primary-500" />
                  <p className="text-2xl font-bold text-primary-600">
                    {getRouteStops(selectedRoute.id).length}
                  </p>
                  <p className="text-sm text-gray-600">站点数</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold text-green-600">约25分钟</p>
                  <p className="text-sm text-gray-600">全程时间</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Bus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">选择一条路线</h3>
              <p className="text-gray-400">点击左侧路线卡片查看详细站点信息</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
