package middleware

import (
	"net/http"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
)

var CasbinEnforcer *casbin.Enforcer

func InitCasbin() {
	e, err := casbin.NewEnforcer("casbin_model.conf", "policy.csv")
	if err != nil {
		panic(err)
	}
	CasbinEnforcer = e
}

func CasbinMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == "OPTIONS" {
			c.Next()
			return
		}

		sub, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "Role not found"})
			c.Abort()
			return
		}

		obj := c.Request.URL.Path
		act := c.Request.Method

		ok, err := CasbinEnforcer.Enforce(sub.(string), obj, act)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Casbin error"})
			c.Abort()
			return
		}

		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
			c.Abort()
			return
		}

		c.Next()
	}
}
