const express = require('express')
const morgan = require('morgan')
require('dotenv').config()
const Person = require('./models/node')
const app = express()

app.use(express.json())
app.use(express.static('dist'))

const errorHandler = (error, request, response,next) => {
    console.log(error.message);
    if(error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({error: error.message})
    }

  next(error)
}

const unknownEndpoint = (request, response) => {
    response.status(404).send('<h1>error: unknown endpoint</h1>')
}

morgan.token('content', (request, response) => {
    const content = JSON.stringify(request.body);
    if(content !== '{}')
        return content;
})

app.use(morgan(':method :url :status :response-time ms :content'))

//routes start

app.get('/api/persons', (request, response) => {
    Person.find({}).then(people => {
        response.json(people)
    })
})

app.get('/info', (request, response) => {
    Person.find({}).then(people => {
        response.send(`<p>Phonebook has info for ${people.length} persons</p><p>${Date()}</p>`)
    })
})

app.get('/api/persons/:id', (request, response,next) => {
    Person.findById(request.params.id)
        .then(person => {
            if(person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if(!body.name || !body.number){
        return response.status(400).json({
            error: 'name or number missing'
        })
    }
    // else if(persons.find(person => person.name === body.name)){
    //     return response.status(400).json({
    //         error: 'name must be unique'
    //     })
    // }
    const person = new Person({
        name: body.name,
        number: body.number,
    })
    person.save().then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))

})

app.delete('/api/persons/:id', (request, response, next) => {

    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const {name, number} = request.body

    Person.findById(request.params.id)
        .then(person => {
            if(!person){
                return response.status(404).end()
            }
            person.name = name
            person.number = number

            return person.save().then((updatedPerson) => {
                response.json(updatedPerson)
            })
        })
        .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})