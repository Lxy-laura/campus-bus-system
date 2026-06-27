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
		public.GET("/schedules", controller.GetSchedules)
		// 修改：使用正式实现的 GetStops 控制器
		public.GET("/stops", controller.GetStops)
	}

	protected := r.Group("/api/v1")
	protected.Use(middleware.JWTAuthMiddleware())
	{
		protected.GET("/users/profile", func(c *gin.Context) {
			username, _ := c.Get("username")
			c.JSON(200, gin.H{"username": username})
		})

		adminOnly := protected.Group("")
		adminOnly.Use(middleware.CasbinMiddleware())
		{
			// Route Management
			adminOnly.POST("/routes", controller.CreateRoute)

			// Schedule Management
			adminOnly.POST("/schedules", controller.CreateSchedule)
			adminOnly.DELETE("/schedules/:id", controller.DeleteSchedule)

			// Stop Management
			// 现在这里不会报错了，因为 controller.CreateStop 已定义
			adminOnly.POST("/stops", controller.CreateStop)
		}
	}

	return r
}
