package utils

import (
	"campus-bus/config"
	"errors"
	"log"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func GenerateToken(userID uint, username, role string) (string, error) {
	// 将 expire 从 int 转换为 time.Duration（秒）
	expireDuration := time.Duration(config.Conf.JWT.Expire) * time.Second
	expireTime := time.Now().Add(expireDuration)

	claims := Claims{
		UserID:   userID,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expireTime),
			Issuer:    "campus-bus",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.Conf.JWT.Secret))
}

// 文件路径: campus-bus/utils/jwt.go
func ParseToken(tokenString string) (*Claims, error) {
	log.Printf("Attempting to parse token: %s", tokenString)
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// 临时硬编码 secret
		return []byte("campus_bus_secret_key_2024"), nil
	})
	if err != nil {
		log.Printf("JWT Parse Error: %v", err)
		return nil, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	log.Printf("Invalid Token Claims")
	return nil, errors.New("invalid token")
}
