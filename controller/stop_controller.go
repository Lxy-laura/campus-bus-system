// 文件路径: campus-bus/controller/stop_controller.go
package controller

import (
	"campus-bus/model"
	"campus-bus/service"
	"net/http"
	"strconv"

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

// GetStop 获取单个站点详情
func GetStop(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	stop, err := service.GetStopByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Stop not found"})
		return
	}
	c.JSON(http.StatusOK, stop)
}

// GetStopsByRoute 获取指定路线的站点
func GetStopsByRoute(c *gin.Context) {
	routeIDStr := c.Param("id")
	routeID, err := strconv.ParseUint(routeIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid route ID"})
		return
	}

	stops, err := service.GetStopsByRouteID(uint(routeID))
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

	if err := service.CreateStop(input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create stop"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Stop created successfully"})
}

// UpdateStop 修改站点
func UpdateStop(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	var input struct {
		RouteID  uint   `json:"route_id" binding:"required"`
		Name     string `json:"name" binding:"required"`
		OrderNum int    `json:"order_num" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.UpdateStop(uint(id), input.RouteID, input.Name, input.OrderNum); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stop"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Stop updated"})
}

// DeleteStop 删除站点
func DeleteStop(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	if err := service.DeleteStop(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete stop"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Stop deleted"})
}
