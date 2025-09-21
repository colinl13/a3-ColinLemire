const express = require("express"),
      fs = require("fs"),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library if you"re testing this on your local machine.
      // However, Glitch will install it automatically by looking in your package.json
      // file.
      mime = require("mime"),
      dir = "public/",
      port = 3000

const app = express()

// Middleware to parse JSON bodies
app.use(express.json())

// Middleware to serve static files from public directory
app.use(express.static(dir))

let todoData = [
  { 
    id: 1,
    task: "Complete assignment 2", 
    priority: "high", 
    creation_date: "2025-09-04",
    deadline: "2025-09-08" // hard coded in, high priority usually has a 3 day deadline
  },
  { 
    id: 2,
    task: "Study for exam", 
    priority: "medium", 
    creation_date: "2025-09-04",
    deadline: "2025-09-11"
  },
  { 
    id: 3,
    task: "Buy groceries", 
    priority: "low", 
    creation_date: "2025-09-04",
    deadline: "2025-09-18"
  }
]

// Function to calculate derived field (deadline) based on creation_date and priority
function calculateDeadline(creationDate, priority) {
  // Validate the input date
  if (!creationDate || creationDate.trim() === '') {
    throw new Error('Creation date is required')
  }
  
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

// Function to generate new ID for each new todo
function generateId() {
  return Math.max(...todoData.map(item => item.id), 0) + 1 // return the highest ID + 1
}

// Route to serve the main HTML page
app.get("/", (request, response) => {
  sendFile(response, "public/index.html")
})

// Route to get all todos
app.get("/todos", (request, response) => {
  response.json(todoData)
})

// Route to add a new todo
app.post("/todos", (request, response) => {
  const formData = request.body
  console.log("Received data:", formData)

  // Server logic: Add derived field before integrating with existing dataset
  const newTodo = {
    id: generateId(),
    task: formData.task,
    priority: formData.priority,
    creation_date: formData.creation_date,
    deadline: calculateDeadline(formData.creation_date, formData.priority) // DERIVED FIELD
  }

  // Add to dataset
  todoData.push(newTodo)
  console.log("Added new todo:", newTodo)
  console.log("All todos:", todoData)

  // Return updated dataset to client
  response.json(todoData)
  
})

// Route to delete a todo
app.delete("/todos", (request, respones) => {
  const id = parseInt(request.query.id)
  
  if (id) {
    todoData = todoData.filter(todo => todo.id !== id)
    console.log(`Deleted todo with id ${id}`)
    console.log("Remaining todos:", todoData)
    
    response.json(todoData)
  } else {
    response.status(400).send("Missing id parameter")
  }
})

// Helper function to send files (for non-static files)
const sendFile = function(response, filename) {
  const type = mime.getType(filename)

  fs.readFile(filename, function(err, content) {
    // if the error = null, then we've loaded the file successfully
    if (err === null) {
      // status code: https://httpstatuses.com
      response.setHeader("Content-Type", type)
      response.send(content)
    } else {
      // file not found, error code 404
      response.status(404).send("404 Error: File Not Found")
    }
  })
}

app.listen(process.env.PORT || port, () => {
  console.log(`Server running on port ${process.env.PORT || port}`)
})