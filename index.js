require('dotenv').config()
const { response } = require('express')
const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')
app.use(cors())
app.use(express.static('build'))
app.use(express.json())
morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response) => {
  Person.find({})
    .then(persons => response.json(persons))
})

app.get('/info', (request, response) => {
  const time = new Date()
  Person.find({})
    .then(persons => {
      response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${time}</p>
  `)
    })
    .catch(error => next(error))

})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) response.json(person)
      else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  if (body === undefined) {
    return response.status(400).json({ error:'No content' })
  }

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(
    request.params.id,
    person,
    { new: true, runValidators:true, context:'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error:'Name or number is missing'
    })
  }
  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => {
      next(error)
    })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformated id' })
  }
  else if (error.name === 'ValidationError') {
    if (error.errors.number) {
      return res.status(400).json({ error: error.errors.number.message })
    }
    return res.status(400).json({ error:error.message })
  }
  next(error)
}

app.use(unknownEndpoint)

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
