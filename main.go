package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
)

//go:embed web/*
var embedded embed.FS

func main() {
	webFS, err := fs.Sub(embedded, "web")
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.FS(webFS)))

	addr := ":8080"
	log.Printf("Toneweave listening on http://localhost%s", addr)

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
