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

// GetAllStops 获取所有站点
func GetAllStops() ([]model.Stop, error) {
	ctx := context.Background()
	cacheKey := "bus:stops:all"

	// 1. 尝试从 Redis 获取
	val, err := database.RDB.Get(ctx, cacheKey).Result()
	if err == nil {
		var stops []model.Stop
		if err := json.Unmarshal([]byte(val), &stops); err == nil {
			return stops, nil
		}
	}

	// 2. Redis 未命中，查询数据库
	var stops []model.Stop
	if err := database.DB.Find(&stops).Error; err != nil {
		return nil, err
	}

	// 3. 写入 Redis 缓存
	data, err := json.Marshal(stops)
	if err != nil {
		log.Printf("Failed to marshal stops: %v", err)
	} else if err := database.RDB.Set(ctx, cacheKey, data, 10*time.Minute).Err(); err != nil {
		log.Printf("Failed to cache stops: %v", err)
	}

	return stops, nil
}

// GetStopsByRouteID 获取指定路线的站点，按 OrderNum 排序
func GetStopsByRouteID(routeID uint) ([]model.Stop, error) {
	ctx := context.Background()
	cacheKey := fmt.Sprintf("bus:stops:route:%d", routeID)

	val, err := database.RDB.Get(ctx, cacheKey).Result()
	if err == nil {
		var stops []model.Stop
		if err := json.Unmarshal([]byte(val), &stops); err == nil {
			return stops, nil
		}
	}

	var stops []model.Stop
	// 关键：按 order_num 排序
	if err := database.DB.Where("route_id = ?", routeID).Order("order_num ASC").Find(&stops).Error; err != nil {
		return nil, err
	}

	data, err := json.Marshal(stops)
	if err != nil {
		log.Printf("Failed to marshal stops: %v", err)
	} else if err := database.RDB.Set(ctx, cacheKey, data, 10*time.Minute).Err(); err != nil {
		log.Printf("Failed to cache stops: %v", err)
	}

	return stops, nil
}

func CreateStop(stop model.Stop) error {
	if err := database.DB.Create(&stop).Error; err != nil {
		return err
	}
	// 清除相关缓存
	database.RDB.Del(context.Background(), "bus:stops:all")
	database.RDB.Del(context.Background(), fmt.Sprintf("bus:stops:route:%d", stop.RouteID))
	return nil
}
