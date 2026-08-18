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
	// API For ticket
	api.Post("/createTicket", handler.CreateTicket)
	api.Get("/getTickets", handler.GetTickets)
	api.Get("/getTicketById/:id", handler.GetTicketById)
	api.Put("/updateTicket/:id", handler.UpdateTicket)
	api.Delete("/deleteTicket/:id", handler.DeleteTicket)

	// API For Auth Registers and Login
	auth := api.Group("/auth")
	auth.Post("/register", handler.Register)
	auth.Post("/login", handler.Login)

	// Listen di port 8080
	app.Listen(":8080")
}
