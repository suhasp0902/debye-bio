package handler

import (
	"net/http"

	"debye-bio/pkg/debye"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	if !debye.MethodGuard(w, r, http.MethodPost) {
		return
	}
	if !debye.AuthGuard(w, r) {
		return
	}
	req, err := debye.DecodeRequest(r)
	if err != nil {
		debye.WriteJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_json", "message": err.Error()})
		return
	}
	debye.WriteJSON(w, http.StatusOK, debye.RunSimulation(req))
}
