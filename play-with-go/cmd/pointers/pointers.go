package main

import "fmt"

func addOne(num int) {
	num = num + 1
}

func addOnePtr(num *int) {

	*num = *num + 1
}
func main() {

	fmt.Println("Hello this is the Pointers file")

	var x int = 5

	fmt.Println(x)

	var xPtr *int = &x
	fmt.Println(xPtr)

	addOne(x)
	fmt.Println(x)

	addOnePtr(xPtr)
	fmt.Println(x)

}
