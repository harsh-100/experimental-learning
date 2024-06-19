package main

import (
	"fmt"
)

type gasEngine struct {
	mpg       uint
	gallons   uint
	ownerInfo owner
}

type owner struct {
	name string
}

func (e gasEngine) milesLeft() uint {
	return e.gallons * e.mpg
}

func main() {

	var myEngine gasEngine = gasEngine{25, 24, owner{"harsh"}}
	myEngine.gallons = 10
	fmt.Println(myEngine.mpg)
	fmt.Println(myEngine.ownerInfo.name)
	fmt.Println(myEngine.milesLeft())

}
