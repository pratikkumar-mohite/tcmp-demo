package firestore

import (
	"context"
	"event-registration-backend/config"
	"cloud.google.com/go/firestore"
	"firebase.google.com/go/v4"
	"log"
	"os"
)

var (
	Client     *firestore.Client
	ClientID   string
	ctx        = context.Background()
)

func InitializeFirestore(cfg *config.Config) error {
	credentialsPath := cfg.FirestoreCredentialsPath
	
	// Only set credentials path if provided, otherwise use Application Default Credentials (ADC)
	if credentialsPath != "" {
		if _, err := os.Stat(credentialsPath); os.IsNotExist(err) {
			log.Fatalf("Firestore credentials file not found: %s", credentialsPath)
		}
		os.Setenv("GOOGLE_APPLICATION_CREDENTIALS", credentialsPath)
		log.Printf("Using Firestore credentials from: %s", credentialsPath)
	} else {
		log.Println("Using Application Default Credentials (ADC) for Firestore")
	}

	app, err := firebase.NewApp(ctx, nil)
	if err != nil {
		return err
	}

	Client, err = app.Firestore(ctx)
	if err != nil {
		return err
	}

	ClientID = cfg.ClientID
	log.Println("Firestore client initialized successfully")
	return nil
}

func GetAttendeesCollection() *firestore.CollectionRef {
	return Client.Collection("clients").Doc(ClientID).Collection("attendees")
}

func GetSpeakersCollection() *firestore.CollectionRef {
	return Client.Collection("clients").Doc(ClientID).Collection("speakers")
}

func GetSessionsCollection() *firestore.CollectionRef {
	return Client.Collection("clients").Doc(ClientID).Collection("sessions")
}

