package models

import (
	"time"

	"gorm.io/gorm"
)

type BaseModel struct {
	ID        uint
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt
	CreatedBy uint
	UpdatedBy uint
}
