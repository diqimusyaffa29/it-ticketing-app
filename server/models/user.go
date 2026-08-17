package models

type Role string

const (
	RoleAdmin   Role = "Admin"
	RoleTeknisi Role = "Teknisi"
	RolePelapor Role = "Pelapor"
)

type User struct {
	BaseModel

	Name     string
	Email    string `gorm:"unique;not null"`
	Password string `gorm:"not null" json:"-"` //tag json:"-" adalah untuk TIDAK pernah terkirim di respon JSON
	Role     Role   `gorm:"type:varchar(20);default:'Pelapor'"`
}
