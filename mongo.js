const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
`mongodb+srv://sohilnaidoo:${password}@cluster0.bxtqi0v.mongodb.net/phoneBook?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name,
  number
})

if (process.argv.length<4) {
  Person.find({})
    .then(persons => {
      console.log('Phonebook:')
      persons.forEach(person => console.log(`${person.name} ${person.number}`))
      //mongoose.connection.close()
      process.exit(1)
    })
} else {
  person.save().then(result => {
    console.log(`Added ${name} number ${number} to phonebook`)
    console.log(result)
    //mongoose.connection.close()
    process.exit(1)
  })

}


