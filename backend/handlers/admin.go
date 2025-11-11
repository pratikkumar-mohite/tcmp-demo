package handlers

import (
	"context"
	"encoding/json"
	"event-registration-backend/config"
	"event-registration-backend/firestore"
	"event-registration-backend/models"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"google.golang.org/api/iterator"
)

var jwtSecret = []byte("your-secret-key-change-in-production")

type LoginRequest struct {
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

func AdminLogin(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	cfg := config.LoadConfig()
	if req.Password != cfg.AdminPassword {
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"admin": true,
		"exp":   time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(LoginResponse{Token: tokenString})
}

func AdminAuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing authorization header", http.StatusUnauthorized)
			return
		}

		tokenString := authHeader
		if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			tokenString = authHeader[7:]
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		next(w, r)
	}
}

func GetAttendees(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	ctx := context.Background()
	attendeesRef := firestore.GetAttendeesCollection()

	var attendees []models.Attendee
	iter := attendeesRef.Documents(ctx)
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			http.Error(w, "Failed to fetch attendees: "+err.Error(), http.StatusInternalServerError)
			return
		}

		var attendee models.Attendee
		if err := doc.DataTo(&attendee); err != nil {
			continue
		}
		attendee.ID = doc.Ref.ID
		attendees = append(attendees, attendee)
	}

	json.NewEncoder(w).Encode(attendees)
}

func GetStats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	ctx := context.Background()
	attendeesRef := firestore.GetAttendeesCollection()

	designationCount := make(map[string]int)
	iter := attendeesRef.Documents(ctx)
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			http.Error(w, "Failed to fetch stats: "+err.Error(), http.StatusInternalServerError)
			return
		}

		var attendee models.Attendee
		if err := doc.DataTo(&attendee); err != nil {
			continue
		}
		designationCount[attendee.Designation]++
	}

	json.NewEncoder(w).Encode(designationCount)
}

type SpeakerRequest struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Bio      string `json:"bio"`
	PhotoURL string `json:"photoURL"`
}

func AddUpdateSpeaker(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req SpeakerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	speakersRef := firestore.GetSpeakersCollection()

	speaker := models.Speaker{
		Name:     req.Name,
		Bio:      req.Bio,
		PhotoURL: req.PhotoURL,
	}

	if req.ID != "" {
		// Update existing speaker
		_, err := speakersRef.Doc(req.ID).Set(ctx, speaker)
		if err != nil {
			http.Error(w, "Failed to update speaker: "+err.Error(), http.StatusInternalServerError)
			return
		}
		speaker.ID = req.ID
	} else {
		// Create new speaker
		docRef, _, err := speakersRef.Add(ctx, speaker)
		if err != nil {
			http.Error(w, "Failed to create speaker: "+err.Error(), http.StatusInternalServerError)
			return
		}
		speaker.ID = docRef.ID
	}

	json.NewEncoder(w).Encode(speaker)
}

type SessionRequest struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Time        string `json:"time"`
	SpeakerID   string `json:"speakerId"`
}

func AddUpdateSession(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req SessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Title == "" {
		http.Error(w, "Title is required", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	sessionsRef := firestore.GetSessionsCollection()

	session := models.Session{
		Title:       req.Title,
		Description: req.Description,
		Time:        req.Time,
		SpeakerID:   req.SpeakerID,
	}

	if req.ID != "" {
		// Update existing session
		_, err := sessionsRef.Doc(req.ID).Set(ctx, session)
		if err != nil {
			http.Error(w, "Failed to update session: "+err.Error(), http.StatusInternalServerError)
			return
		}
		session.ID = req.ID
	} else {
		// Create new session
		docRef, _, err := sessionsRef.Add(ctx, session)
		if err != nil {
			http.Error(w, "Failed to create session: "+err.Error(), http.StatusInternalServerError)
			return
		}
		session.ID = docRef.ID
	}

	json.NewEncoder(w).Encode(session)
}

