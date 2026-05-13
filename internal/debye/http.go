package debye

import (
	"encoding/json"
	"net/http"
	"strings"
)

func DecodeRequest(r *http.Request) (Request, error) {
	defer r.Body.Close()
	var req Request
	if r.Body == http.NoBody {
		return req, nil
	}
	err := json.NewDecoder(r.Body).Decode(&req)
	return req, err
}

func WriteJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func MethodGuard(w http.ResponseWriter, r *http.Request, method string) bool {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return false
	}
	if r.Method != method {
		WriteError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return false
	}
	return true
}

func AuthGuard(w http.ResponseWriter, r *http.Request) bool {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		WriteError(w, http.StatusUnauthorized, "Authentication required")
		return false
	}
	if !strings.HasPrefix(authHeader, "Bearer ") {
		WriteError(w, http.StatusUnauthorized, "Invalid authentication format")
		return false
	}
	// In production, verify the JWT with Supabase's public key here.
	return true
}

func WriteError(w http.ResponseWriter, status int, message string) {
	WriteJSON(w, status, map[string]any{
		"error":   http.StatusText(status),
		"message": message,
	})
}

func KnowledgeResponse() map[string]any {
	return map[string]any{
		"schemaVersion": 2,
		"tissues":       Tissues,
		"materials":     Materials,
		"signalBands":   SignalBands,
		"citations":     Citations,
	}
}
