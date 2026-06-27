import { useState, useEffect } from 'react'
import { Plus, Trash2, Search, Loader2, X, Check, Clock } from 'lucide-react'
import { routeAPI, scheduleAPI } from '../../api'
import { mockRoutes, mockSchedules, getWeekDayInfo, weekDays } from '../../data/mockData'

export default function AdminSchedulesPage() {
  const [routes, setRoutes] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [newSchedule, setNewSchedule] = useState({ route_id: '', depart_time: '', week_day: 1 })
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [toast, setToast] = useState(null)

  const fetchRoutes = async () => {
    try {
      const data = await routeAPI.getRoutes()
      setRoutes(data)
      if (data.length > 0) {
        setSelectedRoute(data[0])
        setNewSchedule(s => ({ ...s, route_id: data[0].ID }))
      }
    } catch (err) {
      setRoutes(mockRoutes)
      setSelectedRoute(mockRoutes[0])
      setNewSchedule(s => ({ ...s, route_id: mockRoutes[0].ID }))
    }
  }

  const fetchSchedules = async (routeId) => {
    setLoading(true)
    try {
      const data = await scheduleAPI.getSchedules(routeId)
      setSchedules(data)
    } catch (err) {
      setSchedules(mockSchedules[routeId] || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoutes()
  }, [])

  useEffect(() => {
    if (selectedRoute) {
      fetchSchedules(selectedRoute.ID)
    }
  }, [selectedRoute])

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCreateSchedule = async (e) => {
    e.preventDefault()
    if (!newSchedule.route_id || !newSchedule.depart_time) {
      showToast('error', '请填写完整信息')
      return
    }

    setSubmitting(true)
    try {
      await scheduleAPI.createSchedule({
        RouteID: newSchedule.route_id,
        DepartTime: newSchedule.depart_time,
        WeekDay: newSchedule.week_day,
      })
      showToast('success', '班次创建成功')
      setShowModal(false)
      setNewSchedule({ route_id: selectedRoute?.ID || '', depart_time: '', week_day: 1 })
      fetchSchedules(selectedRoute.ID)
    } catch (err) {
      const newId = Math.max(...schedules.map(s => s.ID), 0) + 1
      const schedule = {
        ID: newId,
        RouteID: newSchedule.route_id,
        DepartTime: newSchedule.depart_time,
        WeekDay: newSchedule.week_day,
      }
      setSchedules([...schedules, schedule])
      showToast('success', '班次创建成功（模拟数据）')
      setShowModal(false)
      setNewSchedule({ route_id: selectedRoute?.ID || '', depart_time: '', week_day: 1 })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSchedule = async (id) => {
    try {
      await scheduleAPI.deleteSchedule(id)
      setSchedules(schedules.filter(s => s.ID !== id))
      setDeleteConfirm(null)
      showToast('success', '班次删除成功')
    } catch (err) {
      setSchedules(schedules.filter(s => s.ID !== id))
      setDeleteConfirm(null)
      showToast('success', '班次删除成功（模拟）')
    }
  }

  const filteredSchedules = schedules.filter(s =>
    s.DepartTime.includes(searchTerm)
  ).sort((a, b) => a.DepartTime.localeCompare(b.DepartTime))

  return (
    <div className="space-y-6">
      {/* Route Selector */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <span className="text-sm font-medium text-gray-700">选择路线：</span>
          <div className="flex flex-wrap gap-2">
            {routes.map((route, index) => (
              <button
                key={route.ID}
                onClick={() => setSelectedRoute(route)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedRoute?.ID === route.ID
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {route.Name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">总班次</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{schedules.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">工作日班次</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {schedules.filter(s => s.WeekDay >= 1 && s.WeekDay <= 5).length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">周末班次</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {schedules.filter(s => s.WeekDay >= 6 && s.WeekDay <= 7).length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">每日班次</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {schedules.filter(s => s.WeekDay === 0).length}
          </p>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索时间..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => {
              setNewSchedule({ route_id: selectedRoute?.ID || '', depart_time: '', week_day: 1 })
              setShowModal(true)
            }}
            className="btn-success flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增班次
          </button>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">ID</th>
                <th className="table-header">发车时间</th>
                <th className="table-header">星期</th>
                <th className="table-header text-right pr-6">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
                    <p className="text-gray-500 mt-2">加载中...</p>
                  </td>
                </tr>
              ) : filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">暂无班次数据</p>
                    <p className="text-sm text-gray-400 mt-1">点击右上角按钮新增班次</p>
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((schedule, index) => {
                  const weekInfo = getWeekDayInfo(schedule.WeekDay)
                  return (
                    <tr key={schedule.ID} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell text-gray-500">#{schedule.ID}</td>
                      <td className="table-cell">
                        <span className="text-xl font-bold text-gradient">
                          {schedule.DepartTime}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${weekInfo.color}`}>
                          {weekInfo.label}
                        </span>
                      </td>
                      <td className="table-cell text-right pr-6">
                        {deleteConfirm === schedule.ID ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDeleteSchedule(schedule.ID)}
                              className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              title="确认删除"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                              title="取消"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(schedule.ID)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">新增班次</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreateSchedule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  所属路线 <span className="text-red-500">*</span>
                </label>
                <select
                  value={newSchedule.route_id}
                  onChange={(e) => setNewSchedule({ ...newSchedule, route_id: parseInt(e.target.value) })}
                  className="input-field"
                >
                  {routes.map(route => (
                    <option key={route.ID} value={route.ID}>
                      {route.Name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  发车时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={newSchedule.depart_time}
                  onChange={(e) => setNewSchedule({ ...newSchedule, depart_time: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  星期 <span className="text-red-500">*</span>
                </label>
                <select
                  value={newSchedule.week_day}
                  onChange={(e) => setNewSchedule({ ...newSchedule, week_day: parseInt(e.target.value) })}
                  className="input-field"
                >
                  {weekDays.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : null}
                  创建班次
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  )
}
