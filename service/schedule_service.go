package service

import (
	"campus-bus/database"
	"campus-bus/model"
	"context"
	"encoding/json"
	"fmt"
	"time"
)

// GetSchedulesByRouteID 获取指定路线的时刻表
func GetSchedulesByRouteID(routeID uint) ([]model.Schedule, error) {
	ctx := context.Background()
	cacheKey := fmt.Sprintf("bus:schedules:route:%d", routeID)

	// 1. 尝试从 Redis 获取
	val, err := database.RDB.Get(ctx, cacheKey).Result()
	if err == nil {
		var schedules []model.Schedule
		if err := json.Unmarshal([]byte(val), &schedules); err == nil {
			return schedules, nil
		}
	}

	// 2. Redis 未命中，查询数据库
	var schedules []model.Schedule
	if err := database.DB.Where("route_id = ?", routeID).Find(&schedules).Error; err != nil {
		return nil, err
	}

	// 3. 写入 Redis 缓存，过期时间 10 分钟
	data, _ := json.Marshal(schedules)
	database.RDB.Set(ctx, cacheKey, data, 10*time.Minute)

	return schedules, nil
}

// CreateSchedule 创建时刻表
func CreateSchedule(schedule model.Schedule) error {
	if err := database.DB.Create(&schedule).Error; err != nil {
		return err
	}
	// 清除对应路线的缓存
	database.RDB.Del(context.Background(), fmt.Sprintf("bus:schedules:route:%d", schedule.RouteID))
	return nil
}

// DeleteSchedule 删除时刻表
func DeleteSchedule(id uint) error {
	// 先查询出 routeID 以便清除缓存
	var s model.Schedule
	if err := database.DB.First(&s, id).Error; err != nil {
		return err
	}

	if err := database.DB.Delete(&model.Schedule{}, id).Error; err != nil {
		return err
	}

	database.RDB.Del(context.Background(), fmt.Sprintf("bus:schedules:route:%d", s.RouteID))
	return nil
}
