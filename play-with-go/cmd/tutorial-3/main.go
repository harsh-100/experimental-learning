package main

import "fmt"

func main() {
	fmt.Println("This file is about the pointers ")

	// the magic of pointers
	var myArr = [5]float32{1, 2, 3, 4, 5}
	fmt.Printf("\nThe array is %v", myArr)
	var result [5]float32 = squareArray(&myArr)
	fmt.Printf("\n The memory address is %p", &myArr)
	fmt.Printf("\nThe result is %v ", result)

}

func squareArray(arr *[5]float32) [5]float32 {
	fmt.Printf("\n The memory address is %p", arr)
	for i := range arr {
		arr[i] = arr[i] * arr[i]
	}
	return *arr
}
