package routes

import (
	"campus-bus/controller"
	"campus-bus/middleware"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func spaMiddleware(staticPath string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if len(c.Request.URL.Path) >= 4 && c.Request.URL.Path[:4] == "/api" {
			c.Next()
			return
		}

		filePath := filepath.Join(staticPath, c.Request.URL.Path)
		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			c.File(filepath.Join(staticPath, "index.html"))
			c.Abort()
			return
		}

		c.Next()
	}
}

func SetupRouter() *gin.Engine {
	r := gin.Default()
	r.Use(gin.Recovery())

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:8080"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

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

		public.GET("/routes", controller.GetRoutes)
		public.GET("/schedules", controller.GetSchedules)
		public.GET("/stops", controller.GetStops)
	}

	protected := r.Group("/api/v1")
	protected.Use(middleware.JWTAuthMiddleware())
	{
		protected.GET("/users/profile", controller.GetProfile)

		adminOnly := protected.Group("")
		adminOnly.Use(middleware.CasbinMiddleware())
		{
			adminOnly.POST("/routes", controller.CreateRoute)
			adminOnly.DELETE("/routes/:id", controller.DeleteRoute)

			adminOnly.POST("/schedules", controller.CreateSchedule)
			adminOnly.DELETE("/schedules/:id", controller.DeleteSchedule)

			adminOnly.POST("/stops", controller.CreateStop)
			adminOnly.DELETE("/stops/:id", controller.DeleteStop)
		}
	}

	if _, err := os.Stat(staticPath); err == nil {
		r.NoRoute(func(c *gin.Context) {
			if len(c.Request.URL.Path) < 4 || c.Request.URL.Path[:4] != "/api" {
				c.File(filepath.Join(staticPath, "index.html"))
				return
			}
			c.JSON(http.StatusNotFound, gin.H{"error": "Not Found"})
		})
	}

	return r
}
