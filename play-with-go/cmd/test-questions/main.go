package main

import (
	"fmt"
)

func main() {

	fmt.Println("Hello world")

	var myVar string = "Hello"
	myVar = "new value"

	var intvar int = 34
	fmt.Printf("The value of myVar is %s\n", myVar)
	fmt.Printf("The value of intVar is %d\n", intvar)
	fmt.Printf("The Type of intVar is %T\n", intvar)

	fmt.Printf("The Type of myVar is %T\n", myVar)

	newVar := "Hello"
	fmt.Println(newVar)

	// if statement :

	isRain := "rain"

	if isRain == "rain" {
		fmt.Println("Will take umbrella")
	} else if isRain == "Snow" {
		fmt.Println("Skii in it")
	} else {
		fmt.Println("Will not take ")
	}

}
