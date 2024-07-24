package main

import (
	"fmt"
)

// https://www.youtube.com/watch?v=jXFZW11-M4U&list=PLDZujg-VgQlZUy1iCqBbe5faZLMkA3g2x&index=5

type storyPage struct {
	title    string
	nextPage *storyPage
}

func playStory(page *storyPage) {

	if page == nil {
		return
	}

	fmt.Println(page.title)
	playStory(page.nextPage)

}

func main() {

	fmt.Println("Hello this is about the linked list")

	p1 := storyPage{"It was a dark and stormy night", nil}
	p2 := storyPage{"You are Alive", nil}
	p3 := storyPage{"Hello World", nil}

	p1.nextPage = &p2
	p2.nextPage = &p3

	playStory(&p1)

}
