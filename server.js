// Loading server modules: express, MongoDB, and environment variables
const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 2121
require('dotenv').config()


let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

// Connecting to our MongoDB database
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)

        // Setting up EJS and express
        app.set('views', __dirname + '/views');
        app.set('view engine', 'ejs')
        app.use(express.static(__dirname + '/public/'))
        app.use(express.urlencoded({ extended: true }))
        app.use(express.json())

        // Handling our GET requests 
        app.get('/',async (request, response)=>{
            try {
                const todoItems = await db.collection('todos').find().toArray()
                const itemsLeft = await db.collection('todos').countDocuments({completed: false})
                response.render('index.ejs', { items: todoItems, left: itemsLeft })
            }
            catch(error){
                console.error(error)
            }
        })
    

        // Handling our POST requests
        app.post('/addTodo', (request, response) => {
            db.collection('todos').insertOne({thing: request.body.todoItem, completed: false})
            .then(result => {
                console.log('Todo Added')
                response.redirect('/')
            })
            .catch(error => console.error(error))
        })

        // Handling our PUT requests
        app.put('/markComplete', (request, response) => {
            db.collection('todos').updateOne({thing: request.body.itemFromJS},{
                $set: {
                    completed: true
                  }
            },{
                sort: {_id: -1},
                upsert: false
            })
            .then(result => {
                console.log('Marked Complete')
                response.json('Marked Complete')
            })
            .catch(error => console.error(error))
        
        })
        
        app.put('/markUnComplete', (request, response) => {
            db.collection('todos').updateOne({thing: request.body.itemFromJS},{
                $set: {
                    completed: false
                  }
            },{
                sort: {_id: -1},
                upsert: false
            })
            .then(result => {
                console.log('Marked Complete')
                response.json('Marked Complete')
            })
            .catch(error => console.error(error))
        
        })

        // Handling our DELETE requests
        app.delete('/deleteItem', (request, response) => {
            db.collection('todos').deleteOne({thing: request.body.itemFromJS})
            .then(result => {
                console.log('Todo Deleted')
                response.json('Todo Deleted')
            })
            .catch(error => console.error(error))
        
        })

        // Listening for requests
        app.listen(process.env.PORT || PORT, ()=>{
            console.log(`Server running on port ${PORT}`)
        })

    })
    .catch(error => console.error(error))