import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Clock, Calendar, ChevronRight, Filter } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { mockRoutes, mockSchedules, getWeekDayInfo, weekDays } from '../data/mockData'
import { routeAPI, scheduleAPI } from '../api'

export default function SchedulePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [routes, setRoutes] = useState([])
  const [schedules, setSchedules] = useState([])
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [selectedWeekDay, setSelectedWeekDay] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const data = await routeAPI.getRoutes()
        setRoutes(data)
        const routeIdFromUrl = searchParams.get('route_id')
        if (routeIdFromUrl && data.length > 0) {
          const route = data.find(r => r.ID === parseInt(routeIdFromUrl))
          if (route) {
            setSelectedRoute(route)
          } else {
            setSelectedRoute(data[0])
          }
        } else if (data.length > 0) {
          setSelectedRoute(data[0])
        }
      } catch (err) {
        setRoutes(mockRoutes)
        const routeIdFromUrl = searchParams.get('route_id')
        if (routeIdFromUrl) {
          const route = mockRoutes.find(r => r.ID === parseInt(routeIdFromUrl))
          setSelectedRoute(route || mockRoutes[0])
        } else {
          setSelectedRoute(mockRoutes[0])
        }
      }
    }
    fetchRoutes()
  }, [searchParams])

  useEffect(() => {
    if (!selectedRoute) return
    
    const fetchSchedules = async () => {
      setLoading(true)
      try {
        const data = await scheduleAPI.getSchedules(selectedRoute.ID)
        setSchedules(data)
      } catch (err) {
        setSchedules(mockSchedules[selectedRoute.ID] || [])
      } finally {
        setLoading(false)
      }
    }
    fetchSchedules()
  }, [selectedRoute])

  const handleRouteChange = (route) => {
    setSelectedRoute(route)
    setSearchParams({ route_id: route.ID })
  }

  const filteredSchedules = schedules.filter(s => {
    if (selectedWeekDay === null) return true
    if (s.WeekDay === 0) return true
    return s.WeekDay === selectedWeekDay
  })

  const sortedSchedules = [...filteredSchedules].sort((a, b) => 
    a.DepartTime.localeCompare(b.DepartTime)
  )

  const groupedByWeekDay = {}
  sortedSchedules.forEach(s => {
    const key = s.WeekDay
    if (!groupedByWeekDay[key]) {
      groupedByWeekDay[key] = []
    }
    groupedByWeekDay[key].push(s)
  })

  const routeColors = [
    'from-blue-500 to-cyan-400',
    'from-emerald-500 to-teal-400',
    'from-purple-500 to-pink-400',
    'from-orange-500 to-amber-400',
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">时刻表查询</h1>
              <p className="text-primary-100 mt-1">选择路线查看详细发车时间</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Route List */}
          <div className="lg:col-span-1">
            <div className="card p-4 sticky top-24">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary-500" />
                选择路线
              </h3>
              <div className="space-y-2">
                {routes.map((route, index) => (
                  <button
                    key={route.ID}
                    onClick={() => handleRouteChange(route)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                      selectedRoute?.ID === route.ID
                        ? 'bg-primary-50 border border-primary-200 shadow-sm'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${routeColors[index % routeColors.length]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white font-bold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${
                          selectedRoute?.ID === route.ID ? 'text-primary-700' : 'text-gray-800'
                        }`}>
                          {route.Name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {schedules.length} 个班次
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        selectedRoute?.ID === route.ID ? 'text-primary-500' : 'text-gray-300'
                      }`} />
                    </div>
                  </button>
                ))}
              </div>

              {/* Week Filter */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="font-medium text-gray-700 text-sm mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  按星期筛选
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedWeekDay(null)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      selectedWeekDay === null
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    全部
                  </button>
                  {weekDays.slice(1).map(day => (
                    <button
                      key={day.value}
                      onClick={() => setSelectedWeekDay(day.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        selectedWeekDay === day.value
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Content */}
          <div className="lg:col-span-3">
            {selectedRoute ? (
              <div className="space-y-6">
                {/* Route Info Card */}
                <div className="card p-6 bg-gradient-to-r from-primary-500 to-accent-500 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/10 rounded-full translate-y-1/2" />
                  <div className="relative">
                    <h2 className="text-2xl font-bold mb-2">{selectedRoute.Name}</h2>
                    <p className="text-white/80 mb-4">{selectedRoute.Description}</p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 opacity-80" />
                        <span className="text-sm">
                          共 <span className="font-bold">{sortedSchedules.length}</span> 个班次
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${
                          selectedRoute.Status === 1 ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70'
                        }`}>
                          {selectedRoute.Status === 1 ? '运营中' : '已停运'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule Table */}
                <div className="card overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">发车时刻表</h3>
                  </div>
                  
                  {loading ? (
                    <div className="p-12 text-center">
                      <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-gray-500">加载中...</p>
                    </div>
                  ) : sortedSchedules.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="font-medium text-gray-700 mb-1">暂无班次</h4>
                      <p className="text-sm text-gray-500">该路线暂无排班信息</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto scrollbar-thin">
                      {Object.keys(groupedByWeekDay).length > 1 ? (
                        <div className="divide-y divide-gray-100">
                          {weekDays.filter(d => groupedByWeekDay[d.value]).map(day => (
                            <div key={day.value}>
                              <div className="px-6 py-3 bg-gray-50 flex items-center gap-3">
                                <span className={`badge ${day.color}`}>
                                  {day.label}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {groupedByWeekDay[day.value]?.length || 0} 个班次
                                </span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4">
                                {groupedByWeekDay[day.value]?.map(schedule => (
                                  <div
                                    key={schedule.ID}
                                    className="text-center p-3 bg-gray-50 rounded-xl hover:bg-primary-50 hover:shadow-sm transition-all cursor-default group"
                                  >
                                    <div className="text-2xl font-bold text-gray-800 group-hover:text-primary-600 transition-colors">
                                      {schedule.DepartTime}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {sortedSchedules.map((schedule, index) => (
                              <div
                                key={schedule.ID}
                                className="relative text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 animate-fade-in"
                                style={{ animationDelay: `${index * 0.05}s` }}
                              >
                                <div className="text-3xl font-bold text-gradient mb-1">
                                  {schedule.DepartTime}
                                </div>
                                {schedule.WeekDay > 0 && (
                                  <span className={`badge ${getWeekDayInfo(schedule.WeekDay).color}`}>
                                    {getWeekDayInfo(schedule.WeekDay).label}
                                  </span>
                                )}
                                {schedule.WeekDay === 0 && (
                                  <span className="badge bg-purple-100 text-purple-700">
                                    每天
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tips */}
                <div className="card p-5 bg-amber-50/50 border border-amber-100">
                  <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    温馨提示
                  </h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• 请提前5分钟到达候车站点，避免错过班车</li>
                    <li>• 节假日班次可能调整，请以实际通知为准</li>
                    <li>• 如遇恶劣天气，班车可能延迟或停运</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <p className="text-gray-500">请选择一条路线查看时刻表</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
