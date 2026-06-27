package model

import (
	"time"

	"gorm.io/gorm"
)

// Route 路线表，例如：A校区-图书馆专线
type Route struct {
	ID          uint           `gorm:"primaryKey" json:"ID"`
	CreatedAt   time.Time      `json:"CreatedAt"`
	UpdatedAt   time.Time      `json:"UpdatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Name        string         `gorm:"size:100;not null" json:"Name" binding:"required"`
	Description string         `gorm:"size:255" json:"Description"`
	Status      int            `gorm:"default:1" json:"Status"` // 1:运行中, 0:停运
}

// Stop 站点表
type Stop struct {
	ID        uint           `gorm:"primaryKey" json:"ID"`
	CreatedAt time.Time      `json:"CreatedAt"`
	UpdatedAt time.Time      `json:"UpdatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	RouteID   uint           `gorm:"not null;index" json:"RouteID"`
	Name      string         `gorm:"size:100;not null" json:"Name" binding:"required"`
	OrderNum  int            `gorm:"not null" json:"OrderNum"` // 站点顺序
}

// Schedule 时刻表
type Schedule struct {
	ID         uint           `gorm:"primaryKey" json:"ID"`
	CreatedAt  time.Time      `json:"CreatedAt"`
	UpdatedAt  time.Time      `json:"UpdatedAt"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
	RouteID    uint           `gorm:"not null;index" json:"RouteID"`
	DepartTime string         `gorm:"size:10;not null" json:"DepartTime" binding:"required"` // HH:mm
	WeekDay    int            `gorm:"not null" json:"WeekDay"`                               // 1-7, 0代表每天
}
