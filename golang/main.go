package main

import (
	"crypto"
	"fmt"
)

type Block struct {
	hash string
	height int
	body string
	time string
	previousBlockHash crypto.Hash
}

func main() {
	// Declare two different two dimensional integer arrays.
	var array1 [2][2]int
	var array2 [2][2]int

	// Add integer values to each individual element.
	array2[0][0] = 10
	array2[0][1] = 20
	array2[1][0] = 30
	array2[1][1] = 40

	// Copy the values from array2 into array1.
	// different memories, different places
	array1 = array2

	fmt.Println(&array1[0][0], &array2[0][0])
}
