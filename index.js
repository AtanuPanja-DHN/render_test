// const http = require('http')

// let notes = [
//     {
//         id: 1,
//         content: "HTML is easy",
//         important: true
//     },
//     {
//         id: 2,
//         content: "Browser can execute only JavaScript",
//         important: false
//     },
//     {
//         id: 3,
//         content: "GET and POST are the most important methods of HTTP protocol",
//         important: true
//     }
// ]
// const app = http.createServer((request, response) => {
//     response.writeHead(200, { 'Content-Type': 'application/json' })
//     response.end(JSON.stringify(notes))
// })

// // const app = http.createServer((request, response) => {
// //     response.writeHead(200, { 'Content-Type': 'text/plain' })
// //     response.end('Hello World')
// // })

// const PORT = 3001
// app.listen(PORT)
// console.log(`Server running on http://localhost:${PORT}`)

const express = require('express')
const app = express()

let notes = [
    {
        id: 1,
        content: "HTML is easy",
        important: true
    },
    {
        id: 2,
        content: "Browser can execute only JavaScript",
        important: false
    },
    {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        important: true
    }
]

// after building the react app in part2, copied the build folder in the root of the backend;
// To make express show static content, the page index.html and the JavaScript, etc., it fetches, we need a built-in middleware from express called static.
app.use(express.static('build'))

// take the middleware to use and allow for requests from all origins:
// cors middleware because origins of frontend and backend are different
const cors = require('cors')

app.use(cors()) // this will allow for all origins outside the frontend origin

// using middlewares
app.use(express.json()) // this facilitates using the json parser, which make it easy to post data to the server

// Making own middleware (like json-parser): Middleware is used for handling the request and response objects
const requestLogger = (request,response,next)=>{
    console.log('Method: ',request.method)
    console.log('Path: ',request.path)
    console.log('Body: ',request.body)
    console.log('---')
    next()
}
app.use(requestLogger)

app.get('/',(request,response)=>{
    response.send('<h1>Hello World</h1>')
})

app.get('/api/notes',(request,response)=>{
    response.json(notes)
})

app.get('/api/notes/:id',(request,response)=>{
    // const id = request.params.id // :id in the url, means that the "params" object of the "request" object contains an "id" key
    const id = Number(request.params.id)
    // console.log(id)
    const note = notes.find(note => {
            // console.log(note.id,typeof note.id,id,typeof id, note.id === id)
            return note.id === id
        }
    )
    // console.log(note)
    
    // response.json(note)
    // There is a problem even if the id is not present in the notes, the response is returned with status code 200 by default, which should not be the case. Rather we should return a status code of 404 and an appropriate message.

    if(note){
        response.json(note)
    }
    else{
        response.status(404).end() // this will generate an error in the page.
    }
})

// Deleting resources
app.delete('/api/notes/:id',(request,response)=>{
    const id = Number(request.params.id)
    notes = notes.filter(note=> note.id !== id)
    response.status(204).end()
})
// Test the DELETE request using Postman
// If you use VSCode, you can use the rest client extension (creator: huachao mao) instead
// Create a directory named requests, and save the request in file as *.rest



// Receiving Data

app.post('/api/notes', (request, response) => {

    // const note = request.body
    // note.id = maxId + 1
    // console.log(request.headers)
    // console.log(request.body.content) // whatever is posted to the server is parsed and included in the request.body object (done by the json parser).
    // console.log(note)
    // response.json(note)

    const generateId = ()=>{
        // const maxId = Number(notes.length > 0 
        //     ? (
        //         notes.reduce(
        //             (a,b)=> a.id > b.id ? a.id: b.id,
        //             0
        //         )
        //     )
        //     : 0)
        const maxId = notes.length > 0
        ? Math.max(...notes.map(n => n.id))
        : 0
        // using the spread syntax in the max method
        return maxId + 1
    }
    const body = request.body

    if(!body.content){
        return response.status(400).json({
            error: "content missing"
        })
    }
    
    const note = {
        content: body.content,
        important: body.important || false,
        date: new Date(),
        id: generateId()
    }

    notes = notes.concat(note) // now we are actually adding the note
    response.json(note)
})


// Let's add the following middleware after our routes. This middleware will be used for catching requests made to non-existent routes. For these requests, the middleware will return an error message in the JSON format.

const unknownEndPoint = (request,response)=>{
    response.status(404).send({error: 'unknown endpoint'})
}
app.use(unknownEndPoint)

// const PORT = 3001

// Sending our application to the internet (Deployment: Fly.io or Render; I am using Render, because it does not require a credit card)



const PORT = process.env.PORT || 3001
// Now we are using the port defined in the environment variable PORT or port 3001 if the environment variable PORT is undefined. Fly.io and Render configure the application port based on that environment variable.

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})