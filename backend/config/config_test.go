package config_test

import (
	"event-registration-backend/config"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoadConfig(t *testing.T) {
	// Save original values
	originalPort := os.Getenv("PORT")
	originalPassword := os.Getenv("ADMIN_PASSWORD")
	originalCreds := os.Getenv("FIRESTORE_CREDENTIALS_PATH")

	// Clean up
	defer func() {
		if originalPort != "" {
			os.Setenv("PORT", originalPort)
		} else {
			os.Unsetenv("PORT")
		}
		if originalPassword != "" {
			os.Setenv("ADMIN_PASSWORD", originalPassword)
		} else {
			os.Unsetenv("ADMIN_PASSWORD")
		}
		if originalCreds != "" {
			os.Setenv("FIRESTORE_CREDENTIALS_PATH", originalCreds)
		} else {
			os.Unsetenv("FIRESTORE_CREDENTIALS_PATH")
		}
	}()

	tests := []struct {
		name           string
		setPort        string
		setPassword    string
		setCreds       string
		expectedPort   string
		expectedPass   string
		expectedCreds  string
	}{
		{
			name:          "Default values",
			expectedPort:  "8080",
			expectedPass:  "admin123",
			expectedCreds: "credentials/india-tech-meetup-2025-4152acea5580.json",
		},
		{
			name:          "Custom port",
			setPort:       "3000",
			expectedPort:  "3000",
			expectedPass:  "admin123",
			expectedCreds: "credentials/india-tech-meetup-2025-4152acea5580.json",
		},
		{
			name:          "Custom password",
			setPassword:   "custompass",
			expectedPort:  "8080",
			expectedPass:  "custompass",
			expectedCreds: "credentials/india-tech-meetup-2025-4152acea5580.json",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Set environment variables
			if tt.setPort != "" {
				os.Setenv("PORT", tt.setPort)
			} else {
				os.Unsetenv("PORT")
			}
			if tt.setPassword != "" {
				os.Setenv("ADMIN_PASSWORD", tt.setPassword)
			} else {
				os.Unsetenv("ADMIN_PASSWORD")
			}
			if tt.setCreds != "" {
				os.Setenv("FIRESTORE_CREDENTIALS_PATH", tt.setCreds)
			} else {
				os.Unsetenv("FIRESTORE_CREDENTIALS_PATH")
			}

			cfg := config.LoadConfig()

			assert.Equal(t, tt.expectedPort, cfg.Port)
			assert.Equal(t, tt.expectedPass, cfg.AdminPassword)
			if tt.setCreds != "" {
				assert.Equal(t, tt.setCreds, cfg.FirestoreCredentialsPath)
			} else {
				assert.Equal(t, tt.expectedCreds, cfg.FirestoreCredentialsPath)
			}
			assert.NotEmpty(t, cfg.ClientID)
		})
	}
}

