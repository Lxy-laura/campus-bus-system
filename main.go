package main

import (
	"campus-bus/config"
	"campus-bus/database"
	"campus-bus/middleware"
	"campus-bus/model"
	"campus-bus/routes"
	"campus-bus/utils"
	"fmt"

	"go.uber.org/zap"
)

func main() {
	// 1. 初始化配置
	if err := config.Init(); err != nil {
		panic("Failed to init config: " + err.Error())
	}

	// 2. 初始化日志
	utils.InitLogger()
	defer utils.Logger.Sync()

	utils.Sugar.Infof("JWT Expire: %v", config.Conf.JWT.Expire)

	// 3. 初始化数据库
	database.InitMySQL()
	database.DB.AutoMigrate(&model.User{}, &model.Route{}, &model.Stop{}, &model.Schedule{})

	// 4. 初始化 Redis
	database.InitRedis()

	// 5. 初始化 Casbin
	middleware.InitCasbin()

	// 6. 启动服务
	r := routes.SetupRouter()
	port := config.Conf.Server.Port
	addr := fmt.Sprintf(":%d", port)

	utils.Sugar.Infof("Server starting on port %d...", port)
	if err := r.Run(addr); err != nil {
		utils.Logger.Fatal("Server start failed", zap.Error(err))
	}
}
