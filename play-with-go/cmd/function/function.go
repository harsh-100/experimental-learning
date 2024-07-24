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

func whereIsTheGuy(p Person) {

	fmt.Println(p.pos.x)
	//fmt.Println(p.pos.y)
	fmt.Println(p.name)
	fmt.Println(p.age)

}

func main() {
	p := Position{3, 4}
	buddy := Person{"Buddy", 21, p}

	whereIsTheGuy(buddy)

}
