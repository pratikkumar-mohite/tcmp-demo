package config

import (
	"os"
)

type Config struct {
	Port                  string
	AdminPassword         string
	FirestoreCredentialsPath string
	ClientID              string
}

func LoadConfig() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	adminPassword := os.Getenv("ADMIN_PASSWORD")
	if adminPassword == "" {
		adminPassword = "admin123" // Default password for development
	}

	credentialsPath := os.Getenv("FIRESTORE_CREDENTIALS_PATH")
	if credentialsPath == "" {
		credentialsPath = "credentials/india-tech-meetup-2025-4152acea5580.json"
	}

	// Client ID from service account JSON
	clientID := "114617498403471847641"

	return &Config{
		Port:                  port,
		AdminPassword:         adminPassword,
		FirestoreCredentialsPath: credentialsPath,
		ClientID:              clientID,
	}
}

