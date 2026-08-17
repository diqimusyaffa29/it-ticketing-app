package main // <-- Pastikan ini 'main', BUKAN 'migrate' atau yang lainnya!

import (
	"fmt"
	"log"

	"ticketing-it-app/server/config"
	"ticketing-it-app/server/models"
)

func main() { // <-- Pastikan ada func main()
	// 1. Konek ke DB
	config.ConnectDatabase()

	fmt.Println("Menjalankan migrasi database...")

	// 2. Jalankan AutoMigrate
	err := config.DB.AutoMigrate(&models.User{}, &models.Ticket{})
	if err != nil {
		log.Fatalf("Gagal melakukan migrasi: %v", err)
	}

	fmt.Println("Migrasi berhasil dilakukan!")
}
