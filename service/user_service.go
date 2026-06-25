package service

import (
	"campus-bus/database"
	"campus-bus/model"
	"campus-bus/utils"
	"errors"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func Register(username, password string) error {
	var user model.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err == nil {
		return errors.New("user already exists")
	} else if err != gorm.ErrRecordNotFound {
		return err
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

func InitAdminUser() error {
	var admin model.User
	if err := database.DB.Where("username = ?", "admin").First(&admin).Error; err == nil {
		return nil
	} else if err != gorm.ErrRecordNotFound {
		return err
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123456"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	newAdmin := model.User{
		Username: "admin",
		Password: string(hashedPassword),
		Role:     "admin",
	}
	return database.DB.Create(&newAdmin).Error
}
