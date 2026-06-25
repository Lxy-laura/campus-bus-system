package main

import (
	"campus-bus/config"
	"campus-bus/database"
	"campus-bus/middleware"
	"campus-bus/model"
	"campus-bus/routes"
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	// 1. 初始化配置
	if err := config.Init(); err != nil {
		log.Fatal("Failed to init config:", err)
	}

	log.Printf("JWT Expire: %v", config.Conf.JWT.Expire) // 输出应为 86400

	// 2. 初始化数据库
	database.InitMySQL()
	// 自动建表
	database.DB.AutoMigrate(&model.User{}, &model.Route{}, &model.Stop{}, &model.Schedule{})

	// 3. 初始化 Redis
	database.InitRedis()

	// 4. 初始化 Casbin
	middleware.InitCasbin()

	// 5. 初始化测试数据
	initTestData()

	// 6. 启动服务
	r := routes.SetupRouter()
	port := config.Conf.Server.Port
	addr := fmt.Sprintf(":%d", port)

	log.Printf("Server starting on port %d...", port)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Server start failed: %v", err)
	}
}

func initTestData() {
	// 初始化管理员账号
	var adminUser model.User
	if err := database.DB.Where("username = ?", "admin").First(&adminUser).Error; err != nil {
		log.Println("Creating default admin user...")
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		admin := model.User{
			Username: "admin",
			Password: string(hashedPassword),
			Role:     "admin",
		}
		if err := database.DB.Create(&admin).Error; err != nil {
			log.Printf("Failed to create admin user: %v", err)
		} else {
			log.Println("Admin user created: username=admin, password=admin123")
		}
	}

	// 初始化测试路线 (route_id=1)
	var testRoute model.Route
	if err := database.DB.First(&testRoute, 1).Error; err != nil {
		log.Println("Creating default test route (ID=1)...")
		route := model.Route{
			Name:        "校区专线1号",
			Description: "从南门到图书馆",
			Status:      1,
		}
		route.ID = 1
		if err := database.DB.Create(&route).Error; err != nil {
			log.Printf("Failed to create test route: %v", err)
		} else {
			log.Println("Test route created: ID=1, name=校区专线1号")
		}
	}
}
