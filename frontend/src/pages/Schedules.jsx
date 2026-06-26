import { useState, useEffect } from 'react'
import { Clock, Bus, Calendar, ChevronDown, AlertCircle } from 'lucide-react'
import { scheduleAPI, routeAPI } from '../services/api'

const weekDays = [
  { value: 0, label: '每天' },
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 7, label: '周日' },
]

export default function Schedules() {
  const [schedules, setSchedules] = useState([])
  const [routes, setRoutes] = useState([])
  const [selectedRoute, setSelectedRoute] = useState('')
  const [selectedDay, setSelectedDay] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schedulesData, routesData] = await Promise.all([
          scheduleAPI.getSchedules(),
          routeAPI.getRoutes(),
        ])
        setSchedules(schedulesData || [])
        setRoutes(routesData || [])
      } catch (err) {
        console.error('获取数据失败:', err)
        setRoutes([
          { id: 1, name: 'A校区-图书馆专线', status: 1 },
          { id: 2, name: '东区-西区环线', status: 1 },
          { id: 3, name: '南门-地铁口快线', status: 1 },
        ])
        setSchedules([
          { id: 1, route_id: 1, depart_time: '07:00', week_day: 1 },
          { id: 2, route_id: 1, depart_time: '07:30', week_day: 1 },
          { id: 3, route_id: 1, depart_time: '08:00', week_day: 1 },
          { id: 4, route_id: 1, depart_time: '08:30', week_day: 1 },
          { id: 5, route_id: 1, depart_time: '09:00', week_day: 1 },
          { id: 6, route_id: 1, depart_time: '10:00', week_day: 1 },
          { id: 7, route_id: 1, depart_time: '11:00', week_day: 1 },
          { id: 8, route_id: 1, depart_time: '12:00', week_day: 1 },
          { id: 9, route_id: 1, depart_time: '14:00', week_day: 1 },
          { id: 10, route_id: 1, depart_time: '16:00', week_day: 1 },
          { id: 11, route_id: 1, depart_time: '18:00', week_day: 1 },
          { id: 12, route_id: 1, depart_time: '20:00', week_day: 1 },
          { id: 13, route_id: 1, depart_time: '07:00', week_day: 0 },
          { id: 14, route_id: 1, depart_time: '09:00', week_day: 0 },
          { id: 15, route_id: 1, depart_time: '11:00', week_day: 0 },
          { id: 16, route_id: 1, depart_time: '14:00', week_day: 0 },
          { id: 17, route_id: 1, depart_time: '17:00', week_day: 0 },
          { id: 18, route_id: 2, depart_time: '07:15', week_day: 1 },
          { id: 19, route_id: 2, depart_time: '08:15', week_day: 1 },
          { id: 20, route_id: 2, depart_time: '09:15', week_day: 1 },
          { id: 21, route_id: 2, depart_time: '10:15', week_day: 1 },
          { id: 22, route_id: 2, depart_time: '12:15', week_day: 1 },
          { id: 23, route_id: 2, depart_time: '14:15', week_day: 1 },
          { id: 24, route_id: 2, depart_time: '16:15', week_day: 1 },
          { id: 25, route_id: 2, depart_time: '18:15', week_day: 1 },
          { id: 26, route_id: 3, depart_time: '06:30', week_day: 1 },
          { id: 27, route_id: 3, depart_time: '07:00', week_day: 1 },
          { id: 28, route_id: 3, depart_time: '07:30', week_day: 1 },
          { id: 29, route_id: 3, depart_time: '08:00', week_day: 1 },
          { id: 30, route_id: 3, depart_time: '08:30', week_day: 1 },
          { id: 31, route_id: 3, depart_time: '09:00', week_day: 1 },
          { id: 32, route_id: 3, depart_time: '10:00', week_day: 1 },
          { id: 33, route_id: 3, depart_time: '11:00', week_day: 1 },
          { id: 34, route_id: 3, depart_time: '12:00', week_day: 1 },
          { id: 35, route_id: 3, depart_time: '14:00', week_day: 1 },
          { id: 36, route_id: 3, depart_time: '16:00', week_day: 1 },
          { id: 37, route_id: 3, depart_time: '18:00', week_day: 1 },
          { id: 38, route_id: 3, depart_time: '20:00', week_day: 1 },
          { id: 39, route_id: 3, depart_time: '22:00', week_day: 1 },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getRouteName = (routeId) => {
    const route = routes.find((r) => r.id === routeId)
    return route ? route.name : '未知路线'
  }

  const filteredSchedules = schedules.filter((s) => {
    const matchRoute = !selectedRoute || s.route_id === Number(selectedRoute)
    const matchDay = s.week_day === selectedDay || s.week_day === 0
    return matchRoute && matchDay
  })

  const groupedSchedules = routes.reduce((acc, route) => {
    const routeSchedules = filteredSchedules
      .filter((s) => s.route_id === route.id)
      .sort((a, b) => a.depart_time.localeCompare(b.depart_time))
    if (routeSchedules.length > 0) {
      acc[route.id] = routeSchedules
    }
    return acc
  }, {})

  const getNextBus = (routeId) => {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const routeSchedules = filteredSchedules
      .filter((s) => s.route_id === routeId)
      .sort((a, b) => a.depart_time.localeCompare(b.depart_time))
    return routeSchedules.find((s) => s.depart_time > currentTime)
  }

  const calculateMinutesUntil = (departTime) => {
    const now = new Date()
    const [hours, minutes] = departTime.split(':').map(Number)
    const depart = new Date()
    depart.setHours(hours, minutes, 0, 0)
    const diff = Math.round((depart - now) / 60000)
    return diff
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 gradient-text">时刻表查询</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          查看各条路线的发车时间，合理安排你的出行计划
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择路线
            </label>
            <div className="relative">
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all bg-white appearance-none cursor-pointer pr-10"
              >
                <option value="">全部路线</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择日期
            </label>
            <div className="relative">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all bg-white appearance-none cursor-pointer pr-10"
              >
                {weekDays.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {!selectedRoute && Object.keys(groupedSchedules).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {routes
            .filter((route) => groupedSchedules[route.id])
            .slice(0, 3)
            .map((route) => {
              const nextBus = getNextBus(route.id)
              return (
                <div
                  key={route.id}
                  className="glass-card rounded-xl p-5 hover:scale-105 transition-transform duration-300"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-lg gradient-btn flex items-center justify-center">
                      <Bus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">{route.name}</h3>
                      <p className="text-xs text-gray-500">
                        {groupedSchedules[route.id]?.length || 0} 个班次
                      </p>
                    </div>
                  </div>
                  {nextBus ? (
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-600 mb-1">下一班</p>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-green-600">
                          {nextBus.depart_time}
                        </span>
                        <span className="text-sm text-green-500">
                          {calculateMinutesUntil(nextBus.depart_time)} 分钟后
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">今日已无班次</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      )}

      {loading ? (
        <div className="glass-card rounded-2xl p-12 text-center text-gray-500">
          加载中...
        </div>
      ) : Object.keys(groupedSchedules).length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">暂无班次信息</h3>
          <p className="text-gray-400">请选择其他路线或日期</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSchedules).map(([routeId, routeSchedules]) => {
            const route = routes.find((r) => r.id === Number(routeId))
            const nextBus = getNextBus(Number(routeId))
            return (
              <div key={routeId} className="glass-card rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary-500 to-purple-500 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bus className="w-6 h-6 text-white" />
                      <h3 className="text-xl font-bold text-white">{route?.name}</h3>
                    </div>
                    <div className="text-white text-right">
                      <p className="text-sm opacity-80">今日班次</p>
                      <p className="text-2xl font-bold">{routeSchedules.length}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {routeSchedules.map((schedule) => {
                      const isNext = nextBus?.id === schedule.id
                      const minutesUntil = calculateMinutesUntil(schedule.depart_time)
                      const isPast = minutesUntil < 0
                      return (
                        <div
                          key={schedule.id}
                          className={`relative rounded-xl p-3 text-center transition-all duration-300 ${
                            isNext
                              ? 'gradient-btn text-white scale-110 shadow-lg'
                              : isPast
                              ? 'bg-gray-100 text-gray-400'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300 hover:shadow-md'
                          }`}
                        >
                          <Clock className={`w-4 h-4 mx-auto mb-1 ${isNext ? 'text-white' : ''}`} />
                          <p className="text-lg font-bold">{schedule.depart_time}</p>
                          {schedule.week_day === 0 && (
                            <span className={`text-xs ${isNext ? 'text-white/80' : 'text-gray-400'}`}>
                              每日班次
                            </span>
                          )}
                          {isNext && (
                            <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-bold">
                              下一班
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">乘车须知</h3>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start space-x-2">
            <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">1</span>
            <span>请提前 5 分钟到达车站候车，避免错过班车</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">2</span>
            <span>节假日时刻表可能有所调整，请以最新通知为准</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">3</span>
            <span>乘车时请文明礼让，主动为有需要的同学让座</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">4</span>
            <span>如遇恶劣天气，巴士可能会延迟或停运，请留意公告</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
