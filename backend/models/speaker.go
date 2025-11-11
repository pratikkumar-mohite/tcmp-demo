package models

type Speaker struct {
	ID      string `json:"id" firestore:"id"`
	Name    string `json:"name" firestore:"name"`
	Bio     string `json:"bio" firestore:"bio"`
	PhotoURL string `json:"photoURL" firestore:"photoURL"`
}

