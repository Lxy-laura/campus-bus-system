package model

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `gorm:"primaryKey" json:"ID"`
	CreatedAt time.Time      `json:"CreatedAt"`
	UpdatedAt time.Time      `json:"UpdatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Username  string         `gorm:"uniqueIndex;size:50" json:"Username" binding:"required,min=3,max=20"`
	Password  string         `gorm:"size:255" json:"-"` // 不返回给前端
	Role      string         `gorm:"size:20;default:'user'" json:"Role"` // admin or user
}
