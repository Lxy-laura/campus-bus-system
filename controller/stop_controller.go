// 文件路径: campus-bus/controller/stop_controller.go
package controller

import (
	"campus-bus/model"
	"campus-bus/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetStops 处理获取所有站点的请求
func GetStops(c *gin.Context) {
	stops, err := service.GetAllStops()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stops"})
		return
	}
	c.JSON(http.StatusOK, stops)
}

// CreateStop 处理创建站点的请求
func CreateStop(c *gin.Context) {
	var input model.Stop
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.CreateStop(&input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create stop"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"id": input.ID, "message": "Stop created successfully"})
}
