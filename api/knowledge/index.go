package handler

import (
	"net/http"

	"debye-bio/pkg/debye"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	if !debye.MethodGuard(w, r, http.MethodGet) {
		return
	}
	if !debye.AuthGuard(w, r) {
		return
	}
	debye.WriteJSON(w, http.StatusOK, debye.KnowledgeResponse())
}
