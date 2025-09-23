require("dotenv").config()

const express = require("express"),
      fs = require("fs"),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library if you"re testing this on your local machine.
      // However, Glitch will install it automatically by looking in your package.json
      // file.
      mime = require("mime"),
      dir = "public/",
      port = process.env.PORT

const { MongoClient } = require("mongodb")
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@a3-colinlemire.4a7wk7k.mongodb.net/?retryWrites=true&w=majority&appName=a3-colinlemire`

const app = express()

// Middleware to parse JSON bodies
app.use(express.json())

// Middleware to serve static files from public directory
app.use(express.static(dir))

// Function to calculate derived field (deadline) based on creation_date and priority
function calculateDeadline(creationDate, priority) {
  const date = new Date(creationDate)
  // this project taught me that Date is a built in class for JS! First language I have
  // seen that in. 
  let daysToAdd = 7 // default (no input) set to 1 week or "medium" priority
  
  if (priority === "high") {
    daysToAdd = 3 // high priority: 3 days
  } else if (priority === "medium") {
    daysToAdd = 7 // medium priority: 1 week
  } else if (priority === "low") {
    daysToAdd = 14 // low priority: 2 weeks
  }
  
  date.setDate(date.getDate() + daysToAdd)
  return date.toISOString().split('T')[0] // return YYYY-MM-DD format
}

// Route to serve the main HTML page
app.get("/", (request, response) => {
  sendFile(response, "public/index.html")
})

let todosCollection

// Route to get all todos
app.get("/todos", async (request, response) => {
  try {
    const all = await todosCollection.find({}).sort({ id: 1 }).toArray()
    response.json(all)
  } catch (error) {
    console.error(error)
    response.status(500).send("Failed to fetch to-dos")
  }
})

// Route to add a new todo
async function handleCreateTodo(request, response) {
  const formData = request.body

  const { task, priority, creation_date } = formData || {}
  if (!task || !priority || !creation_date) {
    response.status(400).send("Missing required fields: task, priority, creation_date")
    return
  }

  try {
    // Compute next numeric id
    const last = await todosCollection.find({}).sort({ id: -1 }).limit(1).toArray()
    const nextId = (last[0]?.id || 0) + 1

    const newTodo = {
      id: nextId,
      task,
      priority,
      creation_date,
      deadline: calculateDeadline(creation_date, priority)
    }

    await todosCollection.insertOne(newTodo)

    const all = await todosCollection.find({}).sort({ id: 1 }).toArray()
    response.json(all)
  } catch (error) {
    console.error(error)
    response.status(500).send("Failed to add todo")
  }
}

app.post("/todos", handleCreateTodo)
app.post("/submit", handleCreateTodo)

// Route to delete a todo
app.delete("/todos", async (request, response) => {
  const id = parseInt(request.query.id)
  
  if (!id) {
    response.status(400).send("Missing id parameter")
    return
  }

  try {
    await todosCollection.deleteOne({ id })
    const all = await todosCollection.find({}).sort({ id: 1 }).toArray()
    response.json(all)
  } catch (error) {
    console.error(error)
    response.status(500).send("Failed to delete todo")
  }
})

// Helper function to send files (for non-static files)
const sendFile = function(response, filename) {
  const type = mime.getType(filename)

  fs.readFile(filename, function(error, content) {
    // if the error = null, then we've loaded the file successfully
    if (error === null) {
      // status code: https://httpstatuses.com
      response.setHeader("Content-Type", type)
      response.send(content)
    } else {
      // file not found, error code 404
      response.status(404).send("404 Error: File Not Found")
    }
  })
}

// Start server after connecting to MongoDB
const mongoUri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@a3-colinlemire.4a7wk7k.mongodb.net/?retryWrites=true&w=majority&appName=a3-colinlemire`
const mongoDbName = "todolist"

async function start() {
  try {
    console.log(`Connecting to MongoDB at ${mongoUri}, db: ${mongoDbName}`)
    const client = new MongoClient(mongoUri)
    await client.connect()
    const db = client.db(mongoDbName)
    todosCollection = db.collection("todos")

    app.listen(process.env.PORT || port, () => {
      console.log(`Server running on port ${process.env.PORT || port}`)
    })
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    process.exit(1)
  }
}

start()