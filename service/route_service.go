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

// GetRouteByID 根据ID获取路线详情
func GetRouteByID(id uint) (*model.Route, error) {
	// 1. 先构造缓存 key
	ctx := context.Background()
	cacheKey := fmt.Sprintf("bus:routes:%d", id) // bus:routes:1, bus:routes:2

	// 2. 查 Redis 缓存
	val, err := database.RDB.Get(ctx, cacheKey).Result()
	if err == nil {
		var route model.Route
		if err := json.Unmarshal([]byte(val), &route); err == nil {
			return &route, nil // 缓存命中，直接返回
		}
	}

	// 3. 缓存没命中，查数据库
	var route model.Route
	// First = SELECT * FROM routes WHERE id = ? LIMIT 1
	if err := database.DB.First(&route, id).Error; err != nil {
		return nil, err
	}

	// 4. 写入缓存（10分钟过期）
	data, _ := json.Marshal(route)
	database.RDB.Set(ctx, cacheKey, data, 10*time.Minute)

	return &route, nil
}
func DeleteRoute(id uint) error {
	// 1. 先查一下路线是否存在
	var route model.Route
	if err := database.DB.First(&route, id).Error; err != nil {
		return err // 不存在就直接返回错误
	}

	// 2. 开启事务（事务 = 要么全成功，要么全回滚）
	tx := database.DB.Begin()

	// 3. 删除该路线的所有站点
	if err := tx.Where("route_id = ?", id).Delete(&model.Stop{}).Error; err != nil {
		tx.Rollback() // 失败了就回滚，回到之前的状态
		return err
	}

	// 4. 删除该路线的所有时刻表
	if err := tx.Where("route_id = ?", id).Delete(&model.Schedule{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// 5. 删除路线本身
	if err := tx.Delete(&model.Route{}, id).Error; err != nil {
		tx.Rollback()
		return err
	}

	// 6. 所有步骤都成功了，提交事务
	tx.Commit()

	// 7. 清除 Redis 缓存（因为数据变了，缓存就过期了）
	ctx := context.Background() // 修复：使用context.Background()而不是nil
	database.RDB.Del(ctx, "bus:routes:all")
	database.RDB.Del(ctx, "bus:stops:all")
	database.RDB.Del(ctx, fmt.Sprintf("bus:stops:route:%d", id))
	database.RDB.Del(ctx, fmt.Sprintf("bus:schedules:route:%d", id))

	return nil
}
