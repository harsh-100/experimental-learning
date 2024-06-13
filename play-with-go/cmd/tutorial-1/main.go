package main

import (
	"fmt"
	"time"
)


func main(){


	var arr = []int16{1,2,3}

	arr = append(arr, 4,3,4)
	fmt.Println(arr)

	// map is a key value pairs 
	var myMap map[string]uint16 = make(map[string]uint16)
	fmt.Println(myMap)

	var myMap2 = map[string]uint16{"john":23,"ram":24}

	fmt.Println(myMap2)

	var age , ok = myMap2["rama"]
	fmt.Println(age)

	if ok {
		fmt.Printf("The age is %v",age)
	}else{
		fmt.Println("Invalid name")
	}

	for name, age := range myMap2 {
		fmt.Printf("Name : %v, Age:%v \n",name,age)
	}

	// for array 

	var newArr = []int16{12,13,14}
	fmt.Println(newArr)

	newArr = append(newArr, 45,67)
	for i,v := range newArr{
		fmt.Printf("Index is %v , Value is %v \n",i,v)
	}


	// while loop in go is with for

	var num int = 0
	for num<10 {
		fmt.Println(num)
		num = num +1
	}


	// to get the present capacity 
	var n int = 1000000
	var testSlice1 = []int{}

	var testSlice2 = make([]int,0,n)

	fmt.Printf("Total time without prelocate : %v \n",timeLoop(testSlice1,n))
	fmt.Printf("Total time with prelocate : %v \n",timeLoop(testSlice2,n))
}


func timeLoop(slice []int , n int) time.Duration {
	var t0 = time.Now()
	for len(slice) <n{
		slice = append(slice, 1)
	}
	return time.Since(t0)
}



