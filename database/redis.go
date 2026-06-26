package database

import (
	"campus-bus/config"
	"campus-bus/utils"
	"context"
	"fmt"

	"go.uber.org/zap"

	"github.com/go-redis/redis/v8"
)

var RDB *redis.Client

func InitRedis() {
	RDB = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", config.Conf.Redis.Host, config.Conf.Redis.Port),
		Password: config.Conf.Redis.Password,
		DB:       config.Conf.Redis.DB,
	})

	ctx := context.Background()
	_, err := RDB.Ping(ctx).Result()
	if err != nil {
		utils.Logger.Fatal("Failed to connect to Redis", zap.Error(err))
	}
	utils.Sugar.Info("Redis connected successfully")
}
