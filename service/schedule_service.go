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

	val, err := database.RDB.Get(ctx, cacheKey).Result()
	if err == nil {
		var schedules []model.Schedule
		if err := json.Unmarshal([]byte(val), &schedules); err == nil {
			return schedules, nil
		}
	}

	var schedules []model.Schedule
	if err := database.DB.Where("route_id = ?", routeID).Find(&schedules).Error; err != nil {
		return nil, err
	}

	data, _ := json.Marshal(schedules)
	database.RDB.Set(ctx, cacheKey, data, 10*time.Minute)

	return schedules, nil
}

// GetScheduleByID 根据ID获取时刻表详情
func GetScheduleByID(id uint) (*model.Schedule, error) {
	var schedule model.Schedule
	if err := database.DB.First(&schedule, id).Error; err != nil {
		return nil, err
	}
	return &schedule, nil
}

// CreateSchedule 创建时刻表
func CreateSchedule(schedule model.Schedule) error {
	if err := database.DB.Create(&schedule).Error; err != nil {
		return err
	}
	database.RDB.Del(context.Background(), fmt.Sprintf("bus:schedules:route:%d", schedule.RouteID))
	return nil
}

// UpdateSchedule 修改时刻表
func UpdateSchedule(id uint, routeID uint, departTime string, weekDay int) error {
	var schedule model.Schedule
	if err := database.DB.First(&schedule, id).Error; err != nil {
		return err
	}

	oldRouteID := schedule.RouteID

	schedule.RouteID = routeID
	schedule.DepartTime = departTime
	schedule.WeekDay = weekDay

	if err := database.DB.Save(&schedule).Error; err != nil {
		return err
	}

	ctx := context.Background()
	database.RDB.Del(ctx, fmt.Sprintf("bus:schedules:route:%d", oldRouteID))
	if oldRouteID != routeID {
		database.RDB.Del(ctx, fmt.Sprintf("bus:schedules:route:%d", routeID))
	}
	return nil
}

// DeleteSchedule 删除时刻表
func DeleteSchedule(id uint) error {
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
