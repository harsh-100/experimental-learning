package main

import "fmt"


func main(){


	var arr = []int16{1,2,3}

	arr = append(arr, 4,3,4)
	fmt.Println(arr)

	// map is a key value pairs 
	var myMap map[string]uint16 = make(map[string]uint16)
	fmt.Println(myMap)

	var myMap2 = map[string]uint16{"john":23,"ram":24}

	fmt.Println(myMap2)
}




