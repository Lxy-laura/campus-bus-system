package database

import (
	"campus-bus/config"
	"fmt"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitMySQL() {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=%s&parseTime=True&loc=Local",
		config.Conf.Mysql.User,
		config.Conf.Mysql.Password,
		config.Conf.Mysql.Host,
		config.Conf.Mysql.Port,
		config.Conf.Mysql.DBName,
		config.Conf.Mysql.Charset,
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to MySQL: %v", err)
	}

	// 自动迁移表结构 (开发阶段方便，生产环境建议手动迁移)
	// 注意：需要在 main.go 中导入 model 包才能生效，或者在这里引用
	log.Println("MySQL connected successfully")
}
