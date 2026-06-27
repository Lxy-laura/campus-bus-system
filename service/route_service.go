package service

import (
	"campus-bus/database"
	"campus-bus/model"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"
)

// GetRoutes 获取所有路线，优先从 Redis 读取
func GetRoutes() ([]model.Route, error) {
	ctx := context.Background()
	cacheKey := "bus:routes:all"

	// 1. 尝试从 Redis 获取
	val, err := database.RDB.Get(ctx, cacheKey).Result()
	if err == nil {
		var routes []model.Route
		if err := json.Unmarshal([]byte(val), &routes); err == nil {
			return routes, nil
		}
	}

	// 2. Redis 未命中，查询数据库
	var routes []model.Route
	if err := database.DB.Find(&routes).Error; err != nil {
		return nil, err
	}

	// 3. 写入 Redis 缓存，过期时间 10 分钟
	data, err := json.Marshal(routes)
	if err != nil {
		log.Printf("Failed to marshal routes: %v", err)
	} else if err := database.RDB.Set(ctx, cacheKey, data, 10*time.Minute).Err(); err != nil {
		log.Printf("Failed to cache routes: %v", err)
	}

	return routes, nil
}

// CreateRoute 创建路线，并清除缓存
func CreateRoute(name, description string) error {
	route := model.Route{
		Name:        name,
		Description: description,
		Status:      1,
	}
	if err := database.DB.Create(&route).Error; err != nil {
		return err
	}

	// 清除缓存
	database.RDB.Del(context.Background(), "bus:routes:all")
	return nil
}

// DeleteRoute 删除路线
func DeleteRoute(id uint) error {
	if err := database.DB.Delete(&model.Route{}, id).Error; err != nil {
		return err
	}

	// 清除缓存
	database.RDB.Del(context.Background(), "bus:routes:all")
	// 清除相关的时刻表和站点缓存
	database.RDB.Del(context.Background(), fmt.Sprintf("bus:schedules:route:%d", id))
	database.RDB.Del(context.Background(), fmt.Sprintf("bus:stops:route:%d", id))
	// 清除所有站点缓存
	database.RDB.Del(context.Background(), "bus:stops:all")

	return nil
}
