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

	val, err := database.RDB.Get(ctx, cacheKey).Result()
	if err == nil {
		var routes []model.Route
		if err := json.Unmarshal([]byte(val), &routes); err == nil {
			return routes, nil
		}
	}

	var routes []model.Route
	if err := database.DB.Find(&routes).Error; err != nil {
		return nil, err
	}

	data, _ := json.Marshal(routes)
	database.RDB.Set(ctx, cacheKey, data, 10*time.Minute)

	return routes, nil
}

// GetRouteByID 根据ID获取路线详情
func GetRouteByID(id uint) (*model.Route, error) {
	ctx := context.Background()
	cacheKey := fmt.Sprintf("bus:routes:%d", id)

	val, err := database.RDB.Get(ctx, cacheKey).Result()
	if err == nil {
		var route model.Route
		if err := json.Unmarshal([]byte(val), &route); err == nil {
			return &route, nil
		}
	}

	var route model.Route
	if err := database.DB.First(&route, id).Error; err != nil {
		return nil, err
	}

	data, _ := json.Marshal(route)
	database.RDB.Set(ctx, cacheKey, data, 10*time.Minute)

	return &route, nil
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

	database.RDB.Del(context.Background(), "bus:routes:all")
	return nil
}

// UpdateRoute 修改路线
func UpdateRoute(id uint, name, description string, status int) error {
	var route model.Route
	if err := database.DB.First(&route, id).Error; err != nil {
		return err
	}

	route.Name = name
	route.Description = description
	route.Status = status

	if err := database.DB.Save(&route).Error; err != nil {
		return err
	}

	ctx := context.Background()
	database.RDB.Del(ctx, "bus:routes:all")
	database.RDB.Del(ctx, fmt.Sprintf("bus:routes:%d", id))
	return nil
}

// UpdateRouteStatus 修改路线状态（启用/停用）
func UpdateRouteStatus(id uint, status int) error {
	if err := database.DB.Model(&model.Route{}).Where("id = ?", id).Update("status", status).Error; err != nil {
		return err
	}

	ctx := context.Background()
	database.RDB.Del(ctx, "bus:routes:all")
	database.RDB.Del(ctx, fmt.Sprintf("bus:routes:%d", id))
	return nil
}

// DeleteRoute 删除路线
func DeleteRoute(id uint) error {
	if err := database.DB.Delete(&model.Route{}, id).Error; err != nil {
		return err
	}

	ctx := context.Background()
	database.RDB.Del(ctx, "bus:routes:all")
	database.RDB.Del(ctx, fmt.Sprintf("bus:routes:%d", id))
	database.RDB.Del(ctx, fmt.Sprintf("bus:stops:route:%d", id))
	database.RDB.Del(ctx, fmt.Sprintf("bus:schedules:route:%d", id))
	return nil
}
