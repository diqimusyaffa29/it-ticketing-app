package config

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	dsn := "host=localhost user=postgres password=postgres dbname=ticketing_db port=5432 sslmode=disable TimeZone=Asia/Makassar"

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect database: %v", err)
	}

	fmt.Println("Successfully Connected to Database!")

	// Auto migrations
	// err = db.AutoMigrate(&models.User{}, &models.Ticket{})
	// if err != nil {
	// 	log.Fatalf("Failed to auto Migrate: %v", err)
	// }

	// fmt.Println("Auto Migrating done")

	DB = db
}
