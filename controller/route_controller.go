package controller

import (
	"campus-bus/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetRoutes(c *gin.Context) {
	routes, err := service.GetRoutes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch routes"})
		return
	}
	c.JSON(http.StatusOK, routes)
}

func CreateRoute(c *gin.Context) {
	var input struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.CreateRoute(input.Name, input.Description); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create route"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Route created"})
}
