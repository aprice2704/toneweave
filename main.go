package main

import (
	"embed"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net/http"
)

//go:embed web/*
var embedded embed.FS

func main() {
	port := flag.Int("port", 8080, "HTTP port to listen on")
	flag.Parse()

	if *port < 1 || *port > 65535 {
		log.Fatalf("invalid port %d: must be between 1 and 65535", *port)
	}

	webFS, err := fs.Sub(embedded, "web")
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.FS(webFS)))

	addr := fmt.Sprintf(":%d", *port)
	log.Printf("Toneweave listening on http://localhost:%d", *port)

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
