import { useState, useEffect } from 'react'
import { Plus, Trash2, Search, Loader2, X, Check } from 'lucide-react'
import { routeAPI } from '../../api'
import { mockRoutes } from '../../data/mockData'

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newRoute, setNewRoute] = useState({ name: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [toast, setToast] = useState(null)

  const fetchRoutes = async () => {
    setLoading(true)
    try {
      const data = await routeAPI.getRoutes()
      setRoutes(data)
    } catch (err) {
      setRoutes(mockRoutes)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoutes()
  }, [])

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCreateRoute = async (e) => {
    e.preventDefault()
    if (!newRoute.name.trim()) {
      showToast('error', '请输入路线名称')
      return
    }

    setSubmitting(true)
    try {
      await routeAPI.createRoute(newRoute.name, newRoute.description)
      showToast('success', '路线创建成功')
      setShowModal(false)
      setNewRoute({ name: '', description: '' })
      fetchRoutes()
    } catch (err) {
      const newId = Math.max(...routes.map(r => r.ID), 0) + 1
      const route = {
        ID: newId,
        Name: newRoute.name,
        Description: newRoute.description,
        Status: 1,
        CreatedAt: new Date().toISOString(),
        UpdatedAt: new Date().toISOString(),
      }
      setRoutes([...routes, route])
      showToast('success', '路线创建成功（模拟数据）')
      setShowModal(false)
      setNewRoute({ name: '', description: '' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRoute = async (id) => {
    try {
      await routeAPI.deleteRoute(id)
      setRoutes(routes.filter(r => r.ID !== id))
      setDeleteConfirm(null)
      showToast('success', '路线删除成功')
    } catch (err) {
      setRoutes(routes.filter(r => r.ID !== id))
      setDeleteConfirm(null)
      showToast('success', '路线删除成功（模拟）')
    }
  }

  const filteredRoutes = routes.filter(r =>
    r.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.Description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const routeColors = [
    'from-blue-500 to-cyan-400',
    'from-emerald-500 to-teal-400',
    'from-purple-500 to-pink-400',
    'from-orange-500 to-amber-400',
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总路线数</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{routes.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🚌</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">运行中</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {routes.filter(r => r.Status === 1).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已停运</p>
              <p className="text-2xl font-bold text-gray-400 mt-1">
                {routes.filter(r => r.Status === 0).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⏸️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索路线..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-success flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增路线
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">路线</th>
                <th className="table-header">描述</th>
                <th className="table-header">状态</th>
                <th className="table-header">创建时间</th>
                <th className="table-header text-right pr-6">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
                    <p className="text-gray-500 mt-2">加载中...</p>
                  </td>
                </tr>
              ) : filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <p className="text-gray-500">暂无数据</p>
                  </td>
                </tr>
              ) : (
                filteredRoutes.map((route, index) => (
                  <tr key={route.ID} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${routeColors[index % routeColors.length]} rounded-lg flex items-center justify-center`}>
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <span className="font-medium text-gray-800">{route.Name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-gray-600 max-w-xs truncate">
                      {route.Description || '-'}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${
                        route.Status === 1
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {route.Status === 1 ? '运行中' : '已停运'}
                      </span>
                    </td>
                    <td className="table-cell text-gray-500">
                      {route.CreatedAt
                        ? new Date(route.CreatedAt).toLocaleDateString('zh-CN')
                        : '-'}
                    </td>
                    <td className="table-cell text-right pr-6">
                      {deleteConfirm === route.ID ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDeleteRoute(route.ID)}
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
                          onClick={() => setDeleteConfirm(route.ID)}
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
              <h3 className="text-lg font-bold text-gray-800">新增路线</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreateRoute} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  路线名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newRoute.name}
                  onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                  placeholder="例如：1号线 · 教学图书专线"
                  className="input-field"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  路线描述
                </label>
                <textarea
                  value={newRoute.description}
                  onChange={(e) => setNewRoute({ ...newRoute, description: e.target.value })}
                  placeholder="请输入路线描述..."
                  rows={3}
                  className="input-field resize-none"
                />
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
                  创建路线
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
