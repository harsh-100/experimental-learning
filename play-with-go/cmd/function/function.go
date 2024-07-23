package main

import "fmt"

func sayHello() {
	fmt.Println("Hellow")
}

func addOne(x int) int {
	return x + 1
}

type Position struct {
	x float32
	y float32
}

type Person struct {
	name string
	age  int
	pos  Position
}

func main() {
	p := Position{3, 4}

	buddy := Person{"Buddy", 21, p}

	fmt.Println(buddy.pos)
	fmt.Println(buddy.pos.x)
	fmt.Println(buddy.pos.y)

}
