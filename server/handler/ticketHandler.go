package handler

import (
	"ticketing-it-app/server/config"
	"ticketing-it-app/server/models"

	"github.com/gofiber/fiber/v2"
)

type CreateTicketInput struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Priority    string `json:"priority"`
	ReporterID  uint   `json:"reporter_id"`
	AssigneeID  *uint  `json:"assignee_id"`
}

func CreateTicket(c *fiber.Ctx) error {
	var input CreateTicketInput

	// parsing JSON body dari client
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"error": "JSON Format not valid:" + err.Error(),
		})
	}

	// validasi sederhana
	if input.Title == "" || input.Description == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Title and Description must be filled",
		})
	}

	// Buat instance Ticket
	ticket := models.Ticket{
		Title:       input.Title,
		Description: input.Description,
		Status:      "OPEN",
		Priority:    input.Priority,
		ReporterID:  input.ReporterID,
		AssigneeID:  input.AssigneeID,
	}

	// Proses simpan ke db via gorm
	if err := config.DB.Create(&ticket).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to save ticket to db",
		})
	}

	// return response JSON ke client
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Successfully Added New Ticket",
		"data":    ticket,
	})
}

func GetTickets(c *fiber.Ctx) error {
	var tickets []models.Ticket

	// mengambil semua data tickets dengan preload reporter dan assignee
	result := config.DB.Preload("Reporter").Preload("Assignee").Find(&tickets)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get ticket data:" + result.Error.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Successfully get all tickets data",
		"total":   len(tickets),
		"data":    tickets,
	})
}
