package util

import (
	"log"
	"os"
)

var Logger = log.New(os.Stdout, "[weatherd] ", log.LstdFlags|log.Lshortfile)
