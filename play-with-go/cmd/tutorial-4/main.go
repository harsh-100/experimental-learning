package main

import (
	"fmt"
	"math/rand"
	"sync"
	"time"
)

var wg = sync.WaitGroup{}
var dbData = []string{"id1", "id2", "id3",
	"id4",
	"id5"}

var result = []string{}

func main() {
	fmt.Println("This is about the generics")

	t0 := time.Now()

	for i := 0; i < len(dbData); i++ {
		wg.Add(1)
		go dbCall(i)
	}
	wg.Wait()
	fmt.Printf("\n Total execution time %v", time.Since(t0))
	// concurrency is not equal to parallel execution

}

func dbCall(i int) {

	var delay float32 = rand.Float32() * 2000

	time.Sleep(time.Duration(delay) * time.Millisecond)
	fmt.Println(time.Duration(delay) * time.Millisecond)
	fmt.Println(" The result from the database is : ", dbData[i])

	result = append(result, dbData[i])

	wg.Done()
}
