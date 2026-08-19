package middleware

import (
	"fmt"
	"strings"
	"ticketing-it-app/server/handler"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Kita ambil dulu header Authorizationya (format: "Bearer <token>")
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Access Denied: Token can't be found",
			})
		}

		// lalu dari authHeader itu kita potong kata "Bearer" nya
		tokenString := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer"))
		if tokenString == authHeader {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Wrong Token Format",
			})
		}

		// Lalu kita verifikasi tokenString tadi dan masukkan ke dalam variable token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validasi algoritma signing agar wajib HMAC (HS256)
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return handler.JWTSecret, nil
		})

		if err != nil || !token.Valid {
			// Print error ke terminal server Golang untuk debugging
			fmt.Println("--- DEBUG JWT ERROR ---")
			fmt.Println("Token diterima:", tokenString)
			fmt.Println("Pesan Error    :", err)
			fmt.Println("-----------------------")

			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid or expired token: " + err.Error(),
			})
		}

		// Ambil claims (payload) dari token
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Failed to read Token",
			})
		}

		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid user_id in token payload",
			})
		}

		// simpan user_id dan role ke dalam locals (Context Fiber)
		c.Locals("user_id", uint(userIDFloat))
		c.Locals("role", claims["role"].(string))

		return c.Next()
	}
}
