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
	Unit        string `json:"unit"`
	AssigneeID  *uint  `json:"assignee_id"`
}

type UpdateTicketInput struct {
	Status     string `json:"status"`
	Priority   string `json:"priority"`
	Unit       string `json:"unit"`
	AssigneeID *uint  `json:"assignee_id"`
}

func CreateTicket(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var input CreateTicketInput

	// parsing JSON body dari client
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"error": "JSON Format not valid:" + err.Error(),
		})
	}

	// validasi sederhana
	if input.Title == "" || input.Description == "" || input.Unit == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Title, Description and Unit must be filled",
		})
	}

	// Buat instance Ticket
	ticket := models.Ticket{
		Title:       input.Title,
		Description: input.Description,
		Status:      "OPEN",
		Priority:    input.Priority,
		Unit:        input.Unit,
		ReporterID:  userID,
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
	userID := c.Locals("user_id").(uint)
	role := c.Locals("role").(string)
	var tickets []models.Ticket

	// mengambil semua data tickets dengan preload reporter dan assignee
	result := config.DB.Preload("Reporter").Preload("Assignee") //ini sementara akan menjadi SELECT * FROM

	// lalu cek apakah role pada jwt itu adalah "Pelapor", jika iya maka hanya akan menampilkan punya pelapor itu saja
	if role == "Pelapor" {
		result = result.Where("reporter_id = ?", userID) // Kalau ini true, makan querynya akan menjadi SELECT * FROM tickets WHERE reporter_id = 1(misal)
	}

	// Jika bukan pelapor maka akan dilanjutkan ke bawah ini

	if err := result.Find(&tickets).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get tickets data",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Successfully get all tickets data",
		"total":   len(tickets),
		"data":    tickets,
	})
}

func GetTicketById(c *fiber.Ctx) error {
	// untuk mengambil ID dari param ketika hit API
	id := c.Params("id")

	var ticket models.Ticket

	// mengmabil data ticket dengan preload dan berdasar ID
	result := config.DB.Preload("Reporter").Preload("Assignee").Find(&ticket, id)
	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Failed to get ticket data by ID" + result.Error.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Successfully get ticket By ID",
		"data":    ticket,
	})
}

func UpdateTicket(c *fiber.Ctx) error {
	id := c.Params("id")

	var ticket models.Ticket

	// cek dulu apakah ID masih ada di db
	if err := config.DB.First(&ticket, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Can't Find Ticket",
		})
	}

	var input UpdateTicketInput

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "JSON Formats not valid" + err.Error(),
		})
	}

	// Menyiapkan data yanga kan diperbaharui, ini menggunakan partial update dengan kata lain ketika update ID ini, maka tidak akan menimpa data yang tidak dikirim, melainkan hanya mengubah kalau kolom yang dilakukan perubahan
	updateData := make(map[string]interface{})

	if input.Status != "" {
		// Daftar status yang diizinkan
		allowedStatuses := map[string]bool{
			"OPEN":        true,
			"IN_PROGRESS": true,
			"RESOLVED":    true,
			"CLOSED":      true,
		}

		if !allowedStatuses[input.Status] {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Status tidak valid. Gunakan: OPEN, IN_PROGRESS, RESOLVED, atau CLOSED",
			})
		}

		updateData["status"] = input.Status
	}

	if input.Priority != "" {
		updateData["priority"] = input.Priority
	}

	if input.Unit != "" {
		updateData["unit"] = input.Unit
	}

	if input.AssigneeID != nil {
		updateData["assignee_id"] = input.AssigneeID
	}

	// Simpan perubahan ke db
	if err := config.DB.Model(&ticket).Updates(updateData).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update ticket data",
		})
	}

	// Load ulang data ticket dan preload reporter dan assignee
	config.DB.Preload("Reporter").Preload("Assignee").First(&ticket, id)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Ticket Updated",
		"data":    ticket,
	})
}

func DeleteTicket(c *fiber.Ctx) error {
	id := c.Params("id ")

	var ticket models.Ticket
	// cek apakah id ada
	if err := config.DB.First(&ticket, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Ticket not Found",
		})
	}

	// Eksekusi Delete
	if err := config.DB.Delete(&ticket).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Failed to delete Ticket",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Successfully deleted ticket",
	})

}
