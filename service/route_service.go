package service

import (
	"campus-bus/database"
	"campus-bus/model"
	"context"
	"encoding/json"
	"fmt"
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
	data, _ := json.Marshal(routes)
	database.RDB.Set(ctx, cacheKey, data, 10*time.Minute)

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

// DeleteRoute 删除路线，同时删除相关的站点和时刻表，并清除所有相关缓存
func DeleteRoute(id uint) error {
	// 先获取路线信息
	var route model.Route
	if err := database.DB.First(&route, id).Error; err != nil {
		return err
	}

	// 开启事务，确保原子性
	tx := database.DB.Begin()

	// 1. 删除该路线的所有站点
	if err := tx.Where("route_id = ?", id).Delete(&model.Stop{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// 2. 删除该路线的所有时刻表
	if err := tx.Where("route_id = ?", id).Delete(&model.Schedule{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// 3. 删除路线本身
	if err := tx.Delete(&model.Route{}, id).Error; err != nil {
		tx.Rollback()
		return err
	}

	// 提交事务
	tx.Commit()

	// 清除所有相关缓存
	ctx := context.Background()
	database.RDB.Del(ctx, "bus:routes:all")
	database.RDB.Del(ctx, "bus:stops:all")
	database.RDB.Del(ctx, fmt.Sprintf("bus:stops:route:%d", id))
	database.RDB.Del(ctx, fmt.Sprintf("bus:schedules:route:%d", id))

	return nil
}
