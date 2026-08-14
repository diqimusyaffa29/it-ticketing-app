package models

type Role string

const (
	RoleAdmin   Role = "Admin"
	RoleTeknisi Role = "Teknisi"
	RolePelapor Role = "Pelapor"
)

type User struct {
	BaseModel

	Name  string
	Email string `gorm:"unique;not null"`
	Role  Role   `gorm:"type:varchar(20);default:'Pelapor'"`
}
