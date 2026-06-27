package controller

import (
	"campus-bus/model"
	"campus-bus/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetSchedules(c *gin.Context) {
	routeIDStr := c.Query("route_id")
	if routeIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "route_id is required"})
		return
	}

	routeID, err := strconv.ParseUint(routeIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid route_id"})
		return
	}

	schedules, err := service.GetSchedulesByRouteID(uint(routeID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch schedules"})
		return
	}
	c.JSON(http.StatusOK, schedules)
}

func CreateSchedule(c *gin.Context) {
	var input model.Schedule
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.CreateSchedule(input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create schedule"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Schedule created"})
}

func DeleteSchedule(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	if err := service.DeleteSchedule(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete schedule"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Schedule deleted"})
}
