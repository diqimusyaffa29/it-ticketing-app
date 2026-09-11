package handler

import (
	"ticketing-it-app/server/config"
	"ticketing-it-app/server/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Secret key untuk enkripsi JWT (Later can be move to .env)
var JWTSecret = []byte("super_secret_key_123321@")

// DTO Register
type RegisterInput struct {
	Name     string      `json:"name"`
	Username string      `json:"username"`
	Password string      `json:"password"`
	Role     models.Role `json:"role"`
}

// DTO Login
type LoginInput struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func Register(c *fiber.Ctx) error {
	var input RegisterInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON Format",
		})
	}

	if input.Name == "" || input.Username == "" || input.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Name, Username and Password must be filled!"})
	}

	// Buat hashed password dari input.password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to Processed Password",
		})
	}

	// membuat default role jika tidak dibuat
	if input.Role == "" {
		input.Role = models.RolePelapor
	}

	user := models.User{
		Name:     input.Name,
		Username: input.Username,
		Password: string(hashedPassword),
		Role:     input.Role,
	}

	// simpan ke database
	if err := config.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Username is already registered or something went wrong",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Registration success",
		"data":    user,
	})
}

func Login(c *fiber.Ctx) error {
	var input LoginInput

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON Formats",
		})
	}

	// Cari dulu email user yang login
	var user models.User
	if err := config.DB.Where("username = ?", input.Username).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Wrong Username",
		})
	}

	// Jka email ada, maka selanjutnya dilakukan pengecekan Password
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Wrong Password",
		})
	}

	// kalau sudah match email dan passwordnya, buat jwt
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := token.SignedString(JWTSecret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate JWT",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Login Successfull",
		"token":   t,
		"user": fiber.Map{
			"id":       user.ID,
			"name":     user.Name,
			"username": user.Username,
			"role":     user.Role,
		},
	})

}
