package service

import (
	"campus-bus/database"
	"campus-bus/model"
	"campus-bus/utils"

	"golang.org/x/crypto/bcrypt"
)

func Register(username, password string) error {
	// 1. 检查用户是否存在
	var user model.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err == nil {
		return nil // 或者返回错误提示已存在
	}

	// 2. 密码加密
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// 3. 创建用户
	newUser := model.User{
		Username: username,
		Password: string(hashedPassword),
		Role:     "user", // 默认普通用户
	}
	return database.DB.Create(&newUser).Error
}

func Login(username, password string) (string, error) {
	var user model.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		return "", err
	}

	// 验证密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", err
	}

	// 生成 JWT
	token, err := utils.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		return "", err
	}
	return token, nil
}
