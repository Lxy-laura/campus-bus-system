package controller

import (
	"campus-bus/service"
	"net/http"
	"strconv"

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
		var inputUpper struct {
			Name        string `json:"Name" binding:"required"`
			Description string `json:"Description"`
		}
		if err2 := c.ShouldBindJSON(&inputUpper); err2 != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		input.Name = inputUpper.Name
		input.Description = inputUpper.Description
	}

	if err := service.CreateRoute(input.Name, input.Description); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create route"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Route created"})
}

func DeleteRoute(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	if err := service.DeleteRoute(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete route"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Route deleted"})
}
