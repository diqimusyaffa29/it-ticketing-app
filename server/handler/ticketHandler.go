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
)

type CreateTicketInput struct {
	Title        string `json:"title"`
	Description  string `json:"description"`
	Priority     string `json:"priority"`
	Unit         string `json:"unit"`
	ReporterName string `json:"reporter_name"`
	AssigneeID   *uint  `json:"assignee_id"`
}

type UpdateTicketInput struct {
	Status       string  `json:"status"`
	Priority     string  `json:"priority"`
	Unit         string  `json:"unit"`
	ReporterName string  `json:"reporter_name"`
	AssigneeID   *uint   `json:"assignee_id"`
	ProofImage   *string `json:"proof_image"`
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
		Title:        input.Title,
		Description:  input.Description,
		Status:       "OPEN",
		Priority:     input.Priority,
		Unit:         input.Unit,
		ReporterName: input.ReporterName,
		ReporterID:   userID,
		AssigneeID:   input.AssigneeID,
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

	// 1. GUNAKAN c.Locals() untuk membaca data dari Middleware JWT di Fiber
	userID, okUser := c.Locals("user_id").(uint)
	userRole, okRole := c.Locals("role").(string)

	if !okUser || !okRole {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "User context tidak valid",
		})
	}

	var ticket models.Ticket

	// Cek apakah tiket ada di DB
	if err := config.DB.First(&ticket, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Can't Find Ticket",
		})
	}

	var input UpdateTicketInput

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "JSON Formats not valid: " + err.Error(),
		})
	}

	// Map untuk partial update
	updateData := make(map[string]interface{})

	if (strings.EqualFold(userRole, "Teknisi") || strings.EqualFold(userRole, "Admin")) && ticket.AssigneeID == nil {
		updateData["assignee_id"] = userID
	}

	// Validasi & masukan field input ke updateData
	if input.Status != "" {
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

	if input.ReporterName != "" {
		updateData["reporter_name"] = input.ReporterName
	}

	// Jika Admin menentukan AssigneeID secara manual lewat JSON
	if input.AssigneeID != nil {
		updateData["assignee_id"] = input.AssigneeID
	}

	now := time.Now()
	updateData["updated_at"] = now
	updateData["updated_by"] = userID

	// Logic untuk menambahkan data foto bukti
	file, errFile := c.FormFile("proof_image")
	if errFile == nil {
		// Memastikan folder uploads sudah ada (jika belum ada maka akan otomatis terbuat)
		os.MkdirAll("./uploads", os.ModePerm)

		// Beri nama unik menggunakan timestamp agar tidak ada file duplikat
		filename := fmt.Sprintf("%d_%s", time.Now().Unix(), filepath.Base(file.Filename))
		savePath := fmt.Sprintf("./uploads/%s", filename)

		// Simpan file fisik tadi ke dalam server
		if errSave := c.SaveFile(file, savePath); errSave != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to save image proof:" + errSave.Error(),
			})
		}

		// Masukkan string path url tadi ke dalam data yang akan di save ke database
		updateData["proof_image"] = "/uploads/" + filename
	}

	// Simpan perubahan ke DB
	if err := config.DB.Model(&ticket).Updates(updateData).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update ticket data",
		})
	}

	// Load ulang data ticket terbaru beserta Preload relasinya
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
