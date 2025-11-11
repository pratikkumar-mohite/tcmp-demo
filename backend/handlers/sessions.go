package handlers

import (
	"context"
	"encoding/json"
	"event-registration-backend/firestore"
	"event-registration-backend/models"
	"net/http"
)

func GetSessions(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	ctx := context.Background()
	sessionsRef := firestore.GetSessionsCollection()
	speakersRef := firestore.GetSpeakersCollection()

	sessionsSnapshot, err := sessionsRef.Documents(ctx).GetAll()
	if err != nil {
		http.Error(w, "Failed to fetch sessions: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var sessionsWithSpeakers []models.SessionWithSpeaker

	for _, doc := range sessionsSnapshot {
		var session models.Session
		if err := doc.DataTo(&session); err != nil {
			continue
		}
		session.ID = doc.Ref.ID

		sessionWithSpeaker := models.SessionWithSpeaker{
			Session: session,
		}

		// Fetch speaker details
		if session.SpeakerID != "" {
			speakerDoc, err := speakersRef.Doc(session.SpeakerID).Get(ctx)
			if err == nil {
				var speaker models.Speaker
				if err := speakerDoc.DataTo(&speaker); err == nil {
					speaker.ID = speakerDoc.Ref.ID
					sessionWithSpeaker.Speaker = &speaker
				}
			}
		}

		sessionsWithSpeakers = append(sessionsWithSpeakers, sessionWithSpeaker)
	}

	json.NewEncoder(w).Encode(sessionsWithSpeakers)
}

func GetSpeakers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	ctx := context.Background()
	speakersRef := firestore.GetSpeakersCollection()

	speakersSnapshot, err := speakersRef.Documents(ctx).GetAll()
	if err != nil {
		http.Error(w, "Failed to fetch speakers: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var speakers []models.Speaker
	for _, doc := range speakersSnapshot {
		var speaker models.Speaker
		if err := doc.DataTo(&speaker); err != nil {
			continue
		}
		speaker.ID = doc.Ref.ID
		speakers = append(speakers, speaker)
	}

	json.NewEncoder(w).Encode(speakers)
}

