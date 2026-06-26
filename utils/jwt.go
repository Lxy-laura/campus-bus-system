package utils

import (
	"campus-bus/config"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.uber.org/zap"
)

type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func GenerateToken(userID uint, username, role string) (string, error) {
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

func ParseToken(tokenString string) (*Claims, error) {
	Sugar.Debugf("Attempting to parse token: %s", tokenString)
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.Conf.JWT.Secret), nil
	})
	if err != nil {
		Logger.Warn("JWT Parse Error", zap.Error(err))
		return nil, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	Sugar.Warn("Invalid Token Claims")
	return nil, errors.New("invalid token")
}
