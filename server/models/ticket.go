package models

import "github.com/google/uuid"

type Ticket struct {
	BaseModel
	Title        string `json:"title"`
	Description  string `json:"description"`
	Status       string `json:"status"`
	Priority     string `json:"priority"`
	Unit         string `json:"unit"`
	ReporterName string `json:"reporter_name"`

	ReporterID uuid.UUID `json:"reporter_id"`
	Reporter   User      `json:"reporter" gorm:"foreignKey:ReporterID"`

	AssigneeID *uuid.UUID `json:"assignee_id" gorm:"default:null"`
	Assignee   *User      `json:"assignee" gorm:"foreignKey:AssigneeID"`

	ProofImage *string `json:"proof_image"`
}
