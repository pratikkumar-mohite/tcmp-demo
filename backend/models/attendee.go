package models

import "time"

type Attendee struct {
	ID          string    `json:"id" firestore:"id"`
	FullName    string    `json:"fullName" firestore:"fullName"`
	Email       string    `json:"email" firestore:"email"`
	Designation string    `json:"designation" firestore:"designation"`
	CreatedAt   time.Time `json:"createdAt" firestore:"createdAt"`
}

type RegisterRequest struct {
	FullName    string `json:"fullName"`
	Email       string `json:"email"`
	Designation string `json:"designation"`
}

