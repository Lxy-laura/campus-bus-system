import { useState, useEffect } from 'react'
import { Plus, Trash2, Search, Loader2, X, Check, MapPin } from 'lucide-react'
import { routeAPI, stopAPI } from '../../api'
import { mockRoutes, mockStops } from '../../data/mockData'

export default function AdminStopsPage() {
  const [routes, setRoutes] = useState([])
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [newStop, setNewStop] = useState({ route_id: '', name: '', order_num: 1 })
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [toast, setToast] = useState(null)

  const fetchRoutes = async () => {
    try {
      const data = await routeAPI.getRoutes()
      setRoutes(data)
      if (data.length > 0) {
        setSelectedRoute(data[0])
        setNewStop(s => ({ ...s, route_id: data[0].ID }))
      }
    } catch (err) {
      setRoutes(mockRoutes)
      setSelectedRoute(mockRoutes[0])
      setNewStop(s => ({ ...s, route_id: mockRoutes[0].ID }))
    }
  }

  const fetchStops = async () => {
    setLoading(true)
    try {
      const allStops = await stopAPI.getStops()
      setStops(allStops)
    } catch (err) {
      const allStops = Object.values(mockStops).flat()
      setStops(allStops)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoutes()
    fetchStops()
  }, [])

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCreateStop = async (e) => {
    e.preventDefault()
    if (!newStop.route_id || !newStop.name.trim()) {
      showToast('error', '请填写完整信息')
      return
    }

    setSubmitting(true)
    try {
      await stopAPI.createStop({
        RouteID: newStop.route_id,
        Name: newStop.name,
        OrderNum: newStop.order_num,
      })
      showToast('success', '站点创建成功')
      setShowModal(false)
      setNewStop({ route_id: selectedRoute?.ID || '', name: '', order_num: 1 })
      fetchStops()
    } catch (err) {
      const newId = Math.max(...stops.map(s => s.ID), 0) + 1
      const stop = {
        ID: newId,
        RouteID: newStop.route_id,
        Name: newStop.name,
        OrderNum: newStop.order_num,
      }
      setStops([...stops, stop])
      showToast('success', '站点创建成功（模拟数据）')
      setShowModal(false)
      setNewStop({ route_id: selectedRoute?.ID || '', name: '', order_num: 1 })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteStop = async (id) => {
    try {
      await stopAPI.deleteStop(id)
      setStops(stops.filter(s => s.ID !== id))
      setDeleteConfirm(null)
      showToast('success', '站点删除成功')
    } catch (err) {
      setStops(stops.filter(s => s.ID !== id))
      setDeleteConfirm(null)
      showToast('success', '站点删除成功（模拟）')
    }
  }

  const routeStops = selectedRoute
    ? stops
        .filter(s => s.RouteID === selectedRoute.ID)
        .filter(s => s.Name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.OrderNum - b.OrderNum)
    : []

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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">总站点数</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stops.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">当前路线站点</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">{routeStops.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 col-span-2 sm:col-span-1">
          <p className="text-sm text-gray-500">路线数量</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{routes.length}</p>
        </div>
      </div>

      {/* Stop Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索站点名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => {
              const maxOrder = routeStops.length > 0
                ? Math.max(...routeStops.map(s => s.OrderNum)) + 1
                : 1
              setNewStop({ route_id: selectedRoute?.ID || '', name: '', order_num: maxOrder })
              setShowModal(true)
            }}
            className="btn-success flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增站点
          </button>
        </div>

        {/* Visual Route Map */}
        {selectedRoute && routeStops.length > 0 && (
          <div className="px-6 py-4 bg-gradient-to-r from-primary-50 to-accent-50 border-b border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">路线示意图</h4>
            <div className="relative flex items-start gap-0 overflow-x-auto scrollbar-thin pb-2">
              {routeStops.map((stop, idx) => (
                <div key={stop.ID} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      idx === 0
                        ? 'bg-green-500 ring-4 ring-green-200'
                        : idx === routeStops.length - 1
                        ? 'bg-red-500 ring-4 ring-red-200'
                        : 'bg-primary-500 ring-4 ring-primary-200'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className="text-xs text-gray-600 mt-2 max-w-[80px] text-center truncate">
                      {stop.Name}
                    </span>
                  </div>
                  {idx < routeStops.length - 1 && (
                    <div className="w-12 h-1 bg-gradient-to-r from-primary-400 to-primary-300 mt-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header w-16">序号</th>
                <th className="table-header">站点名称</th>
                <th className="table-header">顺序</th>
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
              ) : routeStops.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">暂无站点数据</p>
                    <p className="text-sm text-gray-400 mt-1">点击右上角按钮新增站点</p>
                  </td>
                </tr>
              ) : (
                routeStops.map((stop, idx) => (
                  <tr key={stop.ID} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <span className={`w-7 h-7 inline-flex items-center justify-center rounded-full text-xs font-bold text-white ${
                        idx === 0
                          ? 'bg-green-500'
                          : idx === routeStops.length - 1
                          ? 'bg-red-500'
                          : 'bg-primary-500'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary-500" />
                        <span className="font-medium text-gray-800">{stop.Name}</span>
                        {idx === 0 && (
                          <span className="badge bg-green-100 text-green-700">起点</span>
                        )}
                        {idx === routeStops.length - 1 && (
                          <span className="badge bg-red-100 text-red-700">终点</span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell text-gray-600">
                      第 {stop.OrderNum} 站
                    </td>
                    <td className="table-cell text-right pr-6">
                      {deleteConfirm === stop.ID ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDeleteStop(stop.ID)}
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
                          onClick={() => setDeleteConfirm(stop.ID)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
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
              <h3 className="text-lg font-bold text-gray-800">新增站点</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreateStop} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  所属路线 <span className="text-red-500">*</span>
                </label>
                <select
                  value={newStop.route_id}
                  onChange={(e) => setNewStop({ ...newStop, route_id: parseInt(e.target.value) })}
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
                  站点名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newStop.name}
                  onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                  placeholder="例如：图书馆站"
                  className="input-field"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  站点顺序 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={newStop.order_num}
                  onChange={(e) => setNewStop({ ...newStop, order_num: parseInt(e.target.value) || 1 })}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">数字越小，站点越靠前</p>
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
                  创建站点
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
