package main

import (
	"event-registration-backend/config"
	"event-registration-backend/firestore"
	"event-registration-backend/handlers"
	"event-registration-backend/middleware"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	_ = godotenv.Load()

	// Load configuration
	cfg := config.LoadConfig()

	// Initialize Firestore
	if err := firestore.InitializeFirestore(cfg); err != nil {
		log.Fatalf("Failed to initialize Firestore: %v", err)
	}

	// Setup router
	r := mux.NewRouter()

	// Public API routes
	r.HandleFunc("/api/sessions", handlers.GetSessions).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/speakers", handlers.GetSpeakers).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/register", handlers.RegisterAttendee).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/attendees/count", handlers.GetAttendeeCount).Methods("GET", "OPTIONS")

	// Admin routes
	r.HandleFunc("/api/admin/login", handlers.AdminLogin).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/admin/attendees", handlers.AdminAuthMiddleware(handlers.GetAttendees)).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/admin/stats", handlers.AdminAuthMiddleware(handlers.GetStats)).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/admin/speakers", handlers.AdminAuthMiddleware(handlers.AddUpdateSpeaker)).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/admin/sessions", handlers.AdminAuthMiddleware(handlers.AddUpdateSession)).Methods("POST", "OPTIONS")

	// Serve static files (frontend)
	staticDir := "./static"
	if _, err := os.Stat(staticDir); err == nil {
		fs := http.FileServer(http.Dir(staticDir))
		
		// Serve static assets (JS, CSS, images, etc.)
		r.PathPrefix("/assets/").Handler(http.StripPrefix("/assets/", fs))
		
		// Serve other static files like favicon
		r.PathPrefix("/vite.svg").Handler(fs)
		
		// Serve index.html for all non-API routes (SPA routing)
		// This must be registered last to catch all remaining routes
		r.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			// Skip API routes
			if filepath.HasPrefix(req.URL.Path, "/api") {
				http.NotFound(w, req)
				return
			}
			
			// Check if requested file exists
			requestedPath := filepath.Join(staticDir, req.URL.Path)
			if info, err := os.Stat(requestedPath); err == nil && !info.IsDir() {
				// File exists, serve it
				fs.ServeHTTP(w, req)
			} else {
				// File doesn't exist, serve index.html for SPA routing
				http.ServeFile(w, req, filepath.Join(staticDir, "index.html"))
			}
		})
		log.Println("Static file serving enabled from ./static")
	} else {
		log.Println("Static directory not found, skipping static file serving")
	}

	// CORS middleware - wrap the router
	corsHandler := middleware.CORS(r)

	// Start server
	log.Printf("Server starting on port %s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, corsHandler); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

