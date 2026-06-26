// 文件路径: campus-bus/service/stop_service.go
package service

import (
	"campus-bus/database"
	"campus-bus/model"
	"context"
	"encoding/json"
	"fmt"
	"time"
)

// GetAllStops 获取所有站点
func GetAllStops() ([]model.Stop, error) {
	ctx := context.Background()
	cacheKey := "bus:stops:all"

	val, err := database.RDB.Get(ctx, cacheKey).Result()
	if err == nil {
		var stops []model.Stop
		if err := json.Unmarshal([]byte(val), &stops); err == nil {
			return stops, nil
		}
	}

	var stops []model.Stop
	if err := database.DB.Find(&stops).Error; err != nil {
		return nil, err
	}

	data, _ := json.Marshal(stops)
	database.RDB.Set(ctx, cacheKey, data, 10*time.Minute)

	return stops, nil
}

// GetStopByID 根据ID获取站点详情
func GetStopByID(id uint) (*model.Stop, error) {
	var stop model.Stop
	if err := database.DB.First(&stop, id).Error; err != nil {
		return nil, err
	}
	return &stop, nil
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
	if err := database.DB.Where("route_id = ?", routeID).Order("order_num ASC").Find(&stops).Error; err != nil {
		return nil, err
	}

	data, _ := json.Marshal(stops)
	database.RDB.Set(ctx, cacheKey, data, 10*time.Minute)

	return stops, nil
}

func CreateStop(stop model.Stop) error {
	if err := database.DB.Create(&stop).Error; err != nil {
		return err
	}
	database.RDB.Del(context.Background(), "bus:stops:all")
	database.RDB.Del(context.Background(), fmt.Sprintf("bus:stops:route:%d", stop.RouteID))
	return nil
}

// UpdateStop 修改站点
func UpdateStop(id uint, routeID uint, name string, orderNum int) error {
	var stop model.Stop
	if err := database.DB.First(&stop, id).Error; err != nil {
		return err
	}

	oldRouteID := stop.RouteID

	stop.RouteID = routeID
	stop.Name = name
	stop.OrderNum = orderNum

	if err := database.DB.Save(&stop).Error; err != nil {
		return err
	}

	ctx := context.Background()
	database.RDB.Del(ctx, "bus:stops:all")
	database.RDB.Del(ctx, fmt.Sprintf("bus:stops:route:%d", oldRouteID))
	if oldRouteID != routeID {
		database.RDB.Del(ctx, fmt.Sprintf("bus:stops:route:%d", routeID))
	}
	return nil
}

// DeleteStop 删除站点
func DeleteStop(id uint) error {
	var stop model.Stop
	if err := database.DB.First(&stop, id).Error; err != nil {
		return err
	}

	if err := database.DB.Delete(&model.Stop{}, id).Error; err != nil {
		return err
	}

	ctx := context.Background()
	database.RDB.Del(ctx, "bus:stops:all")
	database.RDB.Del(ctx, fmt.Sprintf("bus:stops:route:%d", stop.RouteID))
	return nil
}
