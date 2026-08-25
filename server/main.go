package main

import (
	"ticketing-it-app/server/config"
	"ticketing-it-app/server/handler"
	"ticketing-it-app/server/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	// Panggil fungsi koneksi database yang ada di folder config
	config.ConnectDatabase()

	// Inisiasi FIber map
	app := fiber.New()

	// MIddleware CORS
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000",
		AllowHeaders:     "Origin, Content-Type, Accept, Authrorization",
		AllowMethods:     "GET, POST, HEAD, PUT, DELETE, PATCH, OPTIONS",
		AllowCredentials: true,
	}))

	// Buat routing group
	api := app.Group("/api")
	// API For ticket

	// 1. Endpoint Publik (Tanpa Token)
	auth := api.Group("/auth")
	auth.Post("/register", handler.Register)
	auth.Post("/login", handler.Login)

	// All route inside /tickets require JWT Login
	tickets := api.Group("/tickets", middleware.Protected())

	// Pelapor, Teknisi, & Admin BISA membuat dan melihat tiket
	tickets.Post("/", handler.CreateTicket)
	tickets.Get("/", handler.GetTickets)
	tickets.Get("/:id", handler.GetTicketById)

	// HANYA Admin & Teknisi yang BISA mengubah tiket (Update Status/Assignee)
	tickets.Put("/:id", middleware.RequireRoles("Admin", "Teknisi"), handler.UpdateTicket)

	// HANYA Admin yang BISA menghapus tiket
	tickets.Delete("/:id", middleware.RequireRoles("Admin"), handler.DeleteTicket)

	// Listen di port 8080
	app.Listen(":8080")
}
