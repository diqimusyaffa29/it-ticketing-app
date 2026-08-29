package models

type Ticket struct {
	BaseModel
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
	Priority    string `json:"priority"`
	Unit        string `json:"unit"`

	ReporterID uint `json:"reporter_id"`
	Reporter   User `json:"reporter" gorm:"foreignKey:ReporterID"`

	AssigneeID *uint `json:"assignee_id" gorm:"default:null"`
	Assignee   *User `json:"assignee" gorm:"foreignKey:AssigneeID"`
}
