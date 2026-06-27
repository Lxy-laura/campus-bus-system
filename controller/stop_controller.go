// controller/stop.go - 添加 DeleteStop 函数
package controller

import (
	"campus-bus/database"
	"campus-bus/model"
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// DeleteStop 删除站点
func DeleteStop(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid stop ID",
		})
		return
	}

	if err := deleteStopFromDB(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete stop: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Stop deleted successfully",
	})
}

// deleteStopFromDB 从数据库删除站点
func deleteStopFromDB(id uint) error {
	// 1. 检查站点是否存在
	var stop model.Stop
	if err := database.DB.First(&stop, id).Error; err != nil {
		return err
	}

	// 2. 开启事务
	tx := database.DB.Begin()

	// 3. 删除与该站点相关的所有时刻表记录
	if err := tx.Where("stop_id = ?", id).Delete(&model.Schedule{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// 4. 删除站点
	if err := tx.Delete(&model.Stop{}, id).Error; err != nil {
		tx.Rollback()
		return err
	}

	// 5. 提交事务
	tx.Commit()

	// 6. 清除相关缓存
	ctx := context.Background()
	database.RDB.Del(ctx, "bus:stops:all")
	database.RDB.Del(ctx, fmt.Sprintf("bus:stops:route:%d", stop.RouteID))
	database.RDB.Del(ctx, fmt.Sprintf("bus:schedules:stop:%d", id))

	return nil
}
