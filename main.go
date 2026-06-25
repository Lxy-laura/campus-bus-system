package main

import (
	"campus-bus/config"
	"campus-bus/database"
	"campus-bus/middleware"
	"campus-bus/model"
	"campus-bus/routes"
	"fmt"
	"log"
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

	// 5. 启动服务
	r := routes.SetupRouter()
	port := config.Conf.Server.Port
	addr := fmt.Sprintf(":%d", port)

	log.Printf("Server starting on port %d...", port)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Server start failed: %v", err)
	}
}
