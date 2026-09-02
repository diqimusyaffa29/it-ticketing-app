package models

import (
	"time"

	"github.com/google/uuid"

	"gorm.io/gorm"
)

type BaseModel struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt *time.Time     `json:"updated_at,omitempty" gorm:"autoUpdateTime:false"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	CreatedBy uuid.UUID      `json:"created_by"`
	UpdatedBy *uuid.UUID     `json:"updated_by,omitempty"`
	DeletedBy *uuid.UUID     `json:"deleted_by,omitempty"`
}

// Hook ini otomatis generate UUID sebelum row di-insert,
// jadi kamu TIDAK perlu setting ID manual di handler manapun
func (b *BaseModel) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}
