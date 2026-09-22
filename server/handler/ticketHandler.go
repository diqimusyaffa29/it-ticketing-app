package handler

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"ticketing-it-app/server/config"
	"ticketing-it-app/server/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type CreateTicketInput struct {
	Title                 string     `json:"title"`
	Description           string     `json:"description"`
	Priority              string     `json:"priority"`
	Unit                  string     `json:"unit"`
	ReporterName          string     `json:"reporter_name"`
	AssigneeID            *uuid.UUID `json:"assignee_id"`
	IssueDescription      *string    `json:"issue_description"`
	SuggestionDescription *string    `json:"suggestion_description"`
}

type UpdateTicketInput struct {
	Status                string     `json:"status"`
	Priority              string     `json:"priority"`
	Unit                  string     `json:"unit"`
	ReporterName          string     `json:"reporter_name"`
	AssigneeID            *uuid.UUID `json:"assignee_id"`
	ProofImage            *string    `json:"proof_image"`
	IssueDescription      *string    `json:"issue_description"`
	SuggestionDescription *string    `json:"suggestion_description"`
}

func CreateTicket(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

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
		Title:                 input.Title,
		Description:           input.Description,
		Status:                "OPEN",
		Priority:              input.Priority,
		Unit:                  input.Unit,
		ReporterName:          input.ReporterName,
		ReporterID:            userID,
		AssigneeID:            input.AssigneeID,
		IssueDescription:      input.IssueDescription,
		SuggestionDescription: input.SuggestionDescription,
		BaseModel: models.BaseModel{
			CreatedBy: userID,
		},
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
	userID := c.Locals("user_id").(uuid.UUID)
	role := c.Locals("role").(string)
	var tickets []models.Ticket

	// mengambil semua data tickets dengan preload reporter dan assignee
	result := config.DB.Order("created_at DESC").Preload("Reporter").Preload("Assignee") //ini sementara akan menjadi SELECT * FROM

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

func GetOnlyActiveTickets(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	role := c.Locals("role").(string)
	var activeTickets []models.Ticket
	// mengambil semua data tickets yang masih aktif (!CLOSED)
	result := config.DB.Where("status <> ?", "CLOSED").Order("created_at DESC").Preload("Reporter").Preload("Assignee")

	if role == "Pelapor" {
		result = result.Where("reporter_id = ?", userID)
	}

	if err := result.Find(&activeTickets).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get Active Ticktes",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Succesfully get all active ticktes data",
		"total":   len(activeTickets),
		"data":    activeTickets,
	})
}

func GetOnlyClosedTickets(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	role := c.Locals("role").(string)
	var closedTickets []models.Ticket

	// mengambil semua data tickets yang sudah CLOSED
	result := config.DB.Where("status = ?", "CLOSED").Order("created_at DESC").Preload("Reporter").Preload("Assignee")

	if role == "Pelapor" {
		result = result.Where("reporter_id", userID)
	}

	if err := result.Find(&closedTickets).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get All Closed Tickets",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Successfully get all Closed Tickets",
		"total":   len(closedTickets),
		"data":    closedTickets,
	})
}

func GetTicketById(c *fiber.Ctx) error {
	// untuk mengambil ID dari param ketika hit API
	id := c.Params("id")
	ticketID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid ticket ID format",
		})
	}
	var ticket models.Ticket

	// mengmabil data ticket dengan preload dan berdasar ID
	result := config.DB.Preload("Reporter").Preload("Assignee").Where("id = ?", ticketID).Find(&ticket)
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

	userID, okUser := c.Locals("user_id").(uuid.UUID)
	userRole, okRole := c.Locals("role").(string)

	if !okUser || !okRole {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "User context tidak valid",
		})
	}

	ticketID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid ticket ID format",
		})
	}

	var ticket models.Ticket
	if err := config.DB.Where("id = ?", ticketID).First(&ticket).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Can't Find Ticket",
		})
	}

	// HAPUS ATAU KOMENTARI c.BodyParser karena kita pakai FormData (multipart/form-data)
	// var input UpdateTicketInput
	// if err := c.BodyParser(&input); err != nil { ... }

	updateData := make(map[string]interface{})

	if (strings.EqualFold(userRole, "Teknisi") || strings.EqualFold(userRole, "Admin")) && ticket.AssigneeID == nil {
		updateData["assignee_id"] = userID
	}

	// AMBIL DATA TEKS MENGGUNAKAN c.FormValue()
	if status := c.FormValue("status"); status != "" {
		allowedStatuses := map[string]bool{
			"OPEN":        true,
			"IN_PROGRESS": true,
			"RESOLVED":    true,
			"CLOSED":      true,
		}

		if !allowedStatuses[status] {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Status tidak valid",
			})
		}
		updateData["status"] = status
	}

	if priority := c.FormValue("priority"); priority != "" {
		updateData["priority"] = priority
	}

	if unit := c.FormValue("unit"); unit != "" {
		updateData["unit"] = unit
	}

	if reporterName := c.FormValue("reporter_name"); reporterName != "" {
		updateData["reporter_name"] = reporterName
	}

	if assigneeIDStr := c.FormValue("assignee_id"); assigneeIDStr != "" {
		if parsedAssigneeID, err := uuid.Parse(assigneeIDStr); err == nil {
			updateData["assignee_id"] = parsedAssigneeID
		}
	}

	// Tangkap issue_description dan suggestion_description dari FormValue
	if issueDesc := c.FormValue("issue_description"); issueDesc != "" {
		updateData["issue_description"] = issueDesc
	}

	if suggestionDesc := c.FormValue("suggestion_description"); suggestionDesc != "" {
		updateData["suggestion_description"] = suggestionDesc
	}

	now := time.Now()
	updateData["updated_at"] = now
	updateData["updated_by"] = userID

	// Logic untuk menambahkan data foto bukti
	file, errFile := c.FormFile("proof_image")
	if errFile == nil {
		os.MkdirAll("./uploads", os.ModePerm)
		filename := fmt.Sprintf("%d_%s", time.Now().Unix(), filepath.Base(file.Filename))
		savePath := fmt.Sprintf("./uploads/%s", filename)

		if errSave := c.SaveFile(file, savePath); errSave != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to save image proof:" + errSave.Error(),
			})
		}

		updateData["proof_image"] = "/uploads/" + filename
		updateData["status"] = "RESOLVED"
	}

	// Simpan perubahan ke DB
	if err := config.DB.Model(&ticket).Updates(updateData).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update ticket data",
		})
	}

	config.DB.Preload("Reporter").Preload("Assignee").Where("id = ?", ticketID).First(&ticket)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Ticket Updated",
		"data":    ticket,
	})
}

func DeleteTicket(c *fiber.Ctx) error {
	id := c.Params("id")
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "User context tidak valid",
		})
	}

	ticketID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid ticket ID format",
		})
	}
	var ticket models.Ticket
	// cek apakah id ada
	if err := config.DB.Where("id = ?", ticketID).First(&ticket).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Ticket not Found",
		})
	}

	deleteData := map[string]interface{}{
		"deleted_by": userID,
		"deleted_at": time.Now(), // Memicu Soft Delete GORM manual via Map
	}

	// Eksekusi Delete
	if err := config.DB.Model(&ticket).Updates(deleteData).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete Ticket: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Successfully deleted ticket",
	})

}
