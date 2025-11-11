package models

type Session struct {
	ID          string `json:"id" firestore:"id"`
	Title       string `json:"title" firestore:"title"`
	Description string `json:"description" firestore:"description"`
	Time        string `json:"time" firestore:"time"`
	SpeakerID   string `json:"speakerId" firestore:"speakerId"`
}

type SessionWithSpeaker struct {
	Session
	Speaker *Speaker `json:"speaker,omitempty"`
}

