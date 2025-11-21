package handlers

import (
	"context"
	"encoding/json"
	"event-registration-backend/firestore"
	"event-registration-backend/models"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	fs "cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

func GetTodos(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	ctx := context.Background()
	todosRef := firestore.GetTodosCollection()

	var todos []models.Todo
	iter := todosRef.OrderBy("createdAt", fs.Desc).Documents(ctx)
	defer iter.Stop()

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			http.Error(w, "Failed to fetch todos: "+err.Error(), http.StatusInternalServerError)
			return
		}

		var todo models.Todo
		if err := doc.DataTo(&todo); err != nil {
			continue
		}
		todo.ID = doc.Ref.ID
		todos = append(todos, todo)
	}

	json.NewEncoder(w).Encode(todos)
}

func CreateTodo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	var todo models.Todo
	if err := json.NewDecoder(r.Body).Decode(&todo); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	if todo.Title == "" {
		http.Error(w, "Title is required", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	todosRef := firestore.GetTodosCollection()

	now := time.Now()
	todo.Completed = false
	todo.CreatedAt = now
	todo.UpdatedAt = now

	docRef, _, err := todosRef.Add(ctx, todo)
	if err != nil {
		http.Error(w, "Failed to create todo: "+err.Error(), http.StatusInternalServerError)
		return
	}

	todo.ID = docRef.ID
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(todo)
}

func UpdateTodo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	vars := mux.Vars(r)
	todoID := vars["id"]

	if todoID == "" {
		http.Error(w, "Todo ID is required", http.StatusBadRequest)
		return
	}

	var updateData map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	todosRef := firestore.GetTodosCollection()
	todoRef := todosRef.Doc(todoID)

	// Check if todo exists
	doc, err := todoRef.Get(ctx)
	if err != nil {
		http.Error(w, "Todo not found", http.StatusNotFound)
		return
	}

	// Get current todo data
	var todo models.Todo
	if err := doc.DataTo(&todo); err != nil {
		http.Error(w, "Failed to read todo: "+err.Error(), http.StatusInternalServerError)
		return
	}
	todo.ID = doc.Ref.ID

	// Apply updates to the todo struct
	if title, ok := updateData["title"].(string); ok {
		todo.Title = title
	}
	if description, ok := updateData["description"].(string); ok {
		todo.Description = description
	}
	if completed, ok := updateData["completed"].(bool); ok {
		todo.Completed = completed
	}
	todo.UpdatedAt = time.Now()

	// Update in Firestore
	_, err = todoRef.Set(ctx, todo)
	if err != nil {
		http.Error(w, "Failed to update todo: "+err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(todo)
}

func DeleteTodo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	vars := mux.Vars(r)
	todoID := vars["id"]

	if todoID == "" {
		http.Error(w, "Todo ID is required", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	todosRef := firestore.GetTodosCollection()
	todoRef := todosRef.Doc(todoID)

	_, err := todoRef.Delete(ctx)
	if err != nil {
		http.Error(w, "Failed to delete todo: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
