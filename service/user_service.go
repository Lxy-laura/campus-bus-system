package service

import (
	"campus-bus/database"
	"campus-bus/model"
	"campus-bus/utils"
	"errors"

	"golang.org/x/crypto/bcrypt"
)

func Register(username, password string) error {
	var user model.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err == nil {
		return nil
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	newUser := model.User{
		Username: username,
		Password: string(hashedPassword),
		Role:     "user",
	}
	return database.DB.Create(&newUser).Error
}

func Login(username, password string) (string, error) {
	var user model.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		return "", err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", err
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		return "", err
	}
	return token, nil
}

// GetUserByID 根据ID获取用户
func GetUserByID(id uint) (*model.User, error) {
	var user model.User
	if err := database.DB.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserList 获取用户列表
func GetUserList(page, pageSize int) ([]model.User, int64, error) {
	var users []model.User
	var total int64

	if err := database.DB.Model(&model.User{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := database.DB.Offset(offset).Limit(pageSize).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

// UpdateUser 修改用户信息
func UpdateUser(id uint, username string) error {
	var user model.User
	if err := database.DB.First(&user, id).Error; err != nil {
		return err
	}

	user.Username = username
	return database.DB.Save(&user).Error
}

// UpdateUserRole 修改用户角色
func UpdateUserRole(id uint, role string) error {
	if role != "admin" && role != "user" {
		return errors.New("invalid role")
	}
	return database.DB.Model(&model.User{}).Where("id = ?", id).Update("role", role).Error
}

// DeleteUser 删除用户
func DeleteUser(id uint) error {
	return database.DB.Delete(&model.User{}, id).Error
}

// UpdatePassword 修改用户密码
func UpdatePassword(id uint, oldPassword, newPassword string) error {
	var user model.User
	if err := database.DB.First(&user, id).Error; err != nil {
		return err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(oldPassword)); err != nil {
		return errors.New("old password incorrect")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.Password = string(hashedPassword)
	return database.DB.Save(&user).Error
}

// UpdateProfile 修改个人信息
func UpdateProfile(id uint, username string) error {
	var user model.User
	if err := database.DB.First(&user, id).Error; err != nil {
		return err
	}

	user.Username = username
	return database.DB.Save(&user).Error
}
