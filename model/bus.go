package model

import "gorm.io/gorm"

// Route 路线表，例如：A校区-图书馆专线
type Route struct {
	gorm.Model
	Name        string `gorm:"size:100;not null" json:"name" binding:"required"`
	Description string `gorm:"size:255" json:"description"`
	Status      int    `gorm:"default:1" json:"status"` // 1:运行中, 0:停运
}

// Stop 站点表
type Stop struct {
	gorm.Model
	RouteID  uint   `gorm:"not null;index" json:"route_id"`
	Name     string `gorm:"size:100;not null" json:"name" binding:"required"`
	OrderNum int    `gorm:"not null" json:"order_num"` // 站点顺序
}

// Schedule 时刻表
type Schedule struct {
	gorm.Model
	RouteID    uint   `gorm:"not null;index" json:"route_id"`
	DepartTime string `gorm:"size:10;not null" json:"depart_time" binding:"required"` // HH:mm
	WeekDay    int    `gorm:"not null" json:"week_day"`                               // 1-7, 0代表每天
}
