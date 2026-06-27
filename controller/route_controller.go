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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := service.CreateRoute(input.Name, input.Description); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create route"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Route created"})
}
func DeleteRoute(c *gin.Context) {
	// 1. 从 URL 路径中取出 id 参数（比如 /routes/5 中的 5）
	idStr := c.Param("id")

	// 2. 把字符串转成数字
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	// 3. 调用 service 层执行删除
	if err := service.DeleteRoute(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete route"})
		return
	}

	// 4. 返回成功
	c.JSON(http.StatusOK, gin.H{"message": "Route deleted successfully"})
}
