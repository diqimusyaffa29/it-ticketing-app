package main

import "ticketing-it-app/server/config"

func main() {
	// Panggil fungsi koneksi database yang ada di folder config
	config.ConnectDatabase()
}
