package config

import (
	"os"
)

type Config struct {
	Port                     string
	AdminPassword            string
	FirestoreCredentialsPath string
	ClientID                 string
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
	// If empty, will use Application Default Credentials (ADC)

	// Client ID from service account JSON
	clientID := "114617498403471847641"

	return &Config{
		Port:                     port,
		AdminPassword:            adminPassword,
		FirestoreCredentialsPath: credentialsPath,
		ClientID:                 clientID,
	}
}
