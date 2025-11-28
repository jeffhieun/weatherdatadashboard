package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/risk", func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		lat := q.Get("latitude")
		lon := q.Get("longitude")
		payload := map[string]interface{}{
			"flood_risk":  "high",
			"probability": 0.82,
			"coords":      map[string]string{"lat": lat, "lon": lon},
		}
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		_ = json.NewEncoder(w).Encode(payload)
	})
	log.Println("flood stub listening on :9000")
	log.Fatal(http.ListenAndServe(":9000", nil))
}
