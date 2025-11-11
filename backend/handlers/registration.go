package handlers

import (
	"context"
	"encoding/json"
	"event-registration-backend/firestore"
	"event-registration-backend/models"
	"net/http"
	"time"

	"google.golang.org/api/iterator"
)

func RegisterAttendee(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.FullName == "" || req.Email == "" || req.Designation == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// Check if email already exists
	ctx := context.Background()
	attendeesRef := firestore.GetAttendeesCollection()
	iter := attendeesRef.Where("email", "==", req.Email).Documents(ctx)
	_, err := iter.Next()
	if err == nil {
		http.Error(w, "Email already registered", http.StatusConflict)
		return
	}

	// Create new attendee
	attendee := models.Attendee{
		FullName:    req.FullName,
		Email:       req.Email,
		Designation: req.Designation,
		CreatedAt:   time.Now(),
	}

	_, _, err = attendeesRef.Add(ctx, attendee)
	if err != nil {
		http.Error(w, "Failed to register attendee: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Registration successful"})
}

func GetAttendeeCount(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	ctx := context.Background()
	attendeesRef := firestore.GetAttendeesCollection()

	count := 0
	iter := attendeesRef.Documents(ctx)
	for {
		_, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			http.Error(w, "Failed to count attendees: "+err.Error(), http.StatusInternalServerError)
			return
		}
		count++
	}

	json.NewEncoder(w).Encode(map[string]int{"count": count})
}

