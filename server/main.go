package main

import (
	"ticketing-it-app/server/config"
	"ticketing-it-app/server/handler"
	"ticketing-it-app/server/middleware"

	"github.com/gofiber/fiber/v2"
)

func main() {
	// Panggil fungsi koneksi database yang ada di folder config
	config.ConnectDatabase()

	// Inisiasi FIber map
	app := fiber.New()

	// Buat routing group
	api := app.Group("/api")
	// API For ticket

	// 1. Endpoint Publik (Tanpa Token)
	auth := api.Group("/auth")
	auth.Post("/register", handler.Register)
	auth.Post("/login", handler.Login)

	// 2. Endpoint Terproteksi (Wajib Token JWT)
	tickets := api.Group("/tickets", middleware.Protected())
	tickets.Post("/", handler.CreateTicket)
	tickets.Get("/", handler.GetTickets)
	tickets.Get("/:id", handler.GetTicketById)
	tickets.Put("/:id", handler.UpdateTicket)
	tickets.Delete("/:id", handler.DeleteTicket)

	// Listen di port 8080
	app.Listen(":8080")
}
