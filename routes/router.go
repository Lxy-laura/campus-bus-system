package routes

import (
	"campus-bus/controller"
	"campus-bus/middleware"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

// spaMiddleware SPA 路由回退中间件
// 如果请求的路径不是 /api 开头，且文件不存在，则返回 index.html
func spaMiddleware(staticPath string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// API 请求直接放行
		if len(c.Request.URL.Path) >= 4 && c.Request.URL.Path[:4] == "/api" {
			c.Next()
			return
		}

		// 尝试查找静态文件
		filePath := filepath.Join(staticPath, c.Request.URL.Path)
		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			// 文件不存在，返回 index.html（SPA 路由）
			c.File(filepath.Join(staticPath, "index.html"))
			c.Abort()
			return
		}

		// 文件存在，继续（gin 的 static 中间件会处理）
		c.Next()
	}
}

func SetupRouter() *gin.Engine {
	r := gin.Default()
	r.Use(gin.Recovery())

	// 静态文件服务 - 前端构建产物
	staticPath := "./frontend/dist"
	if _, err := os.Stat(staticPath); err == nil {
		r.Use(spaMiddleware(staticPath))
		r.Static("/assets", filepath.Join(staticPath, "assets"))
		r.StaticFile("/favicon.svg", filepath.Join(staticPath, "favicon.svg"))
		r.StaticFile("/icons.svg", filepath.Join(staticPath, "icons.svg"))
		r.GET("/", func(c *gin.Context) {
			c.File(filepath.Join(staticPath, "index.html"))
		})
	}

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
		protected.GET("/users/profile", controller.GetProfile)

		adminOnly := protected.Group("")
		adminOnly.Use(middleware.CasbinMiddleware())
		{
			// Route Management
			adminOnly.POST("/routes", controller.CreateRoute)
			adminOnly.DELETE("/routes/:id", controller.DeleteRoute)

			// Schedule Management
			adminOnly.POST("/schedules", controller.CreateSchedule)
			adminOnly.DELETE("/schedules/:id", controller.DeleteSchedule)

			// Stop Management
			adminOnly.POST("/stops", controller.CreateStop)
			adminOnly.DELETE("/stops/:id", controller.DeleteStop)
		}
	}

	// 处理前端路由的回退（确保所有非 API 路径都返回 index.html）
	if _, err := os.Stat(staticPath); err == nil {
		r.NoRoute(func(c *gin.Context) {
			// 只对非 API 请求返回 index.html
			if len(c.Request.URL.Path) < 4 || c.Request.URL.Path[:4] != "/api" {
				c.File(filepath.Join(staticPath, "index.html"))
				return
			}
			c.JSON(http.StatusNotFound, gin.H{"error": "Not Found"})
		})
	}

	return r
}
