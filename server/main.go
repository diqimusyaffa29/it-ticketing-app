package main

import (
	"ticketing-it-app/server/config"
	"ticketing-it-app/server/handler"

	"github.com/gofiber/fiber/v2"
)

func main() {
	// Panggil fungsi koneksi database yang ada di folder config
	config.ConnectDatabase()

	// Inisiasi FIber map
	app := fiber.New()

	// Buat routing group
	api := app.Group("/api")
	api.Post("/createTicket", handler.CreateTicket)

	// Listen di port 8080
	app.Listen(":8080")
}
