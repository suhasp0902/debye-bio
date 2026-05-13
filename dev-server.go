package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	// Using the packages directly since they are in api/ and use debye-bio/pkg/debye
	"debye-bio/pkg/debye"
	
	// We'll define a simple router that mimics Vercel's behavior
	"encoding/json"
)

// We need to import the handlers. Since they are in 'handler' package in different dirs, 
// we might have naming conflicts if we import them all.
// Instead, I'll just write a simple multiplexer here that calls debye functions directly,
// which is what those handlers do anyway.

func main() {
	port := "3001"
	if p := os.Getenv("PORT"); p != "" {
		port = p
	}

	http.HandleFunc("/api/simulate", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var req debye.Request
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			debye.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}
		debye.WriteJSON(w, http.StatusOK, debye.RunSimulation(req))
	})

	http.HandleFunc("/api/drc", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var req debye.Request
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			debye.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}
		debye.WriteJSON(w, http.StatusOK, debye.RunDRC(req))
	})

	http.HandleFunc("/api/copilot", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var req debye.Request
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			debye.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}
		debye.WriteJSON(w, http.StatusOK, debye.AskCopilot(req))
	})

	http.HandleFunc("/api/knowledge", func(w http.ResponseWriter, r *http.Request) {
		debye.WriteJSON(w, http.StatusOK, map[string]any{
			"tissues":   debye.Tissues,
			"materials": debye.Materials,
			"signals":   debye.SignalBands,
		})
	})

	fmt.Printf("Debye Local Backend listening on http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
