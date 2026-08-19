package middleware

import "github.com/gofiber/fiber/v2"

func RequireRoles(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// ambil role dari c.Locals tadi
		userRole, ok := c.Locals("role").(string)
		if !ok {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Access Denied: Role can't be found",
			})
		}

		// Cek apakah role user ada di dalam daftar AllowedRoles
		for _, role := range allowedRoles {
			if role == userRole {
				return c.Next()
			}
		}

		// Jika role tidak cocok
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Access Denied: You don't have access to do this action",
		})

	}
}
