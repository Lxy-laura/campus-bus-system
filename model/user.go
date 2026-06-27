package model

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Username string `gorm:"uniqueIndex;size:50" json:"username" binding:"required,min=3,max=20"`
	Password string `gorm:"size:255" json:"-"`                  // 不返回给前端
	Role     string `gorm:"size:20;default:'user'" json:"role"` // admin or user
}
