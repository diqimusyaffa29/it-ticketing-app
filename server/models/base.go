package models

import (
	"time"

	"gorm.io/gorm"
)

type BaseModel struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt *time.Time     `json:"updated_at,omitempty" gorm:"autoUpdateTime:false"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	CreatedBy uint           `json:"created_by"`
	UpdatedBy *uint          `json:"updated_by,omitempty"`
	DeletedBy *uint          `json:"deleted_by,omitempty"`
}
