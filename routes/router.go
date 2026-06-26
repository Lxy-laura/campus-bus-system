// 文件路径: c:\Users\Administrator\Desktop\campus-bus-system\routes\router.go
package routes

import (
	"campus-bus/controller"
	"campus-bus/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()
	r.Use(gin.Recovery())

	public := r.Group("/api/v1")
	{
		public.POST("/register", controller.Register)
		public.POST("/login", controller.Login)

		// 公开查询接口
		public.GET("/routes", controller.GetRoutes)
		public.GET("/routes/:id", controller.GetRoute)
		public.GET("/schedules", controller.GetSchedules)
		public.GET("/schedules/:id", controller.GetSchedule)
		public.GET("/stops", controller.GetStops)
		public.GET("/stops/:id", controller.GetStop)
		public.GET("/routes/:id/stops", controller.GetStopsByRoute)
	}

	protected := r.Group("/api/v1")
	protected.Use(middleware.JWTAuthMiddleware())
	{
		// 用户个人信息
		protected.GET("/users/profile", controller.GetProfile)
		protected.PUT("/users/profile", controller.UpdateProfile)
		protected.PUT("/users/password", controller.UpdatePassword)

		adminOnly := protected.Group("")
		adminOnly.Use(middleware.CasbinMiddleware())
		{
			// Route Management
			adminOnly.POST("/routes", controller.CreateRoute)
			adminOnly.PUT("/routes/:id", controller.UpdateRoute)
			adminOnly.DELETE("/routes/:id", controller.DeleteRoute)
			adminOnly.PUT("/routes/:id/status", controller.UpdateRouteStatus)

			// Schedule Management
			adminOnly.POST("/schedules", controller.CreateSchedule)
			adminOnly.PUT("/schedules/:id", controller.UpdateSchedule)
			adminOnly.DELETE("/schedules/:id", controller.DeleteSchedule)

			// Stop Management
			adminOnly.POST("/stops", controller.CreateStop)
			adminOnly.PUT("/stops/:id", controller.UpdateStop)
			adminOnly.DELETE("/stops/:id", controller.DeleteStop)

			// User Management
			adminOnly.GET("/users", controller.GetUserList)
			adminOnly.GET("/users/:id", controller.GetUser)
			adminOnly.PUT("/users/:id", controller.UpdateUser)
			adminOnly.DELETE("/users/:id", controller.DeleteUser)
			adminOnly.PUT("/users/:id/role", controller.UpdateUserRole)
		}
	}

	return r
}
