package models

type Ticket struct {
	BaseModel
	Title       string
	Description string
	Status      string
	Priority    string

	ReporterID uint
	Reporter   User `gorm:"foreignKey:ReporterID"`

	AssigneeID uint
	Assignee   User `gorm:"foreignKey:AssigneeID"`
}
