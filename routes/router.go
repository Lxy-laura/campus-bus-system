// 文件路径: routes/router.go
package routes

import (
	"campus-bus/controller"
	"campus-bus/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()
	r.Use(gin.Recovery())

	// 公开接口（不需要登录）
	public := r.Group("/api/v1")
	{
		public.POST("/register", controller.Register)
		public.POST("/login", controller.Login)

		// 公开查询接口
		public.GET("/routes", controller.GetRoutes)
		public.GET("/schedules", controller.GetSchedules)
		public.GET("/stops", controller.GetStops)
	}

	// 需要登录的接口
	protected := r.Group("/api/v1")
	protected.Use(middleware.JWTAuthMiddleware())
	{
		// 获取用户信息
		protected.GET("/users/profile", func(c *gin.Context) {
			username, _ := c.Get("username")
			c.JSON(200, gin.H{"username": username})
		})

		// 管理员专属接口（需要 Casbin 权限验证）
		adminOnly := protected.Group("")
		adminOnly.Use(middleware.CasbinMiddleware())
		{
			// ===== 路线管理 =====
			adminOnly.POST("/routes", controller.CreateRoute)       // 创建路线
			adminOnly.DELETE("/routes/:id", controller.DeleteRoute) // 删除路线

			// ===== 时刻表管理 =====
			adminOnly.POST("/schedules", controller.CreateSchedule)       // 创建班次
			adminOnly.DELETE("/schedules/:id", controller.DeleteSchedule) // 删除班次

			// ===== 站点管理 =====
			adminOnly.POST("/stops", controller.CreateStop)       // 创建站点
			adminOnly.DELETE("/stops/:id", controller.DeleteStop) // 删除站点
		}
	}

	return r
}
