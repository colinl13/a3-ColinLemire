const http = require( "http" ),
      fs   = require( "fs" ),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library if you"re testing this on your local machine.
      // However, Glitch will install it automatically by looking in your package.json
      // file.
      mime = require( "mime" ),
      dir  = "public/",
      port = 3000

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

const server = http.createServer( function( request,response ) {
  if( request.method === "GET" ) {
    handleGet( request, response )    
  }else if( request.method === "POST" ){
    handlePost( request, response ) 
  }else if( request.method === "DELETE" ){
    handleDelete( request, response )
  }
})

const handleGet = function( request, response ) {
  const filename = dir + request.url.slice( 1 ) 

  if( request.url === "/" ) {
    sendFile( response, "public/index.html" )
  } else if( request.url === "/todos" ) { // return todo data set
    response.writeHead( 200, "OK", {"Content-Type": "application/json" })
    response.end( JSON.stringify(todoData, null, 2) )
  } else {
    sendFile( response, filename )
  }
}

const handlePost = function( request, response ) {
  let dataString = ""

  request.on( "data", function( data ) {
      dataString += data 
  })

  request.on( "end", function() {
    const formData = JSON.parse( dataString )
    console.log( "Received data:", formData )

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
    response.writeHead( 200, "OK", {"Content-Type": "application/json" })
    response.end( JSON.stringify(todoData) )
  })
}

const handleDelete = function( request, response ) {
  const url = new URL(request.url, `http://${request.headers.host}`)
  const id = parseInt(url.searchParams.get('id'))
  
  if (id) {
    todoData = todoData.filter(todo => todo.id !== id)
    console.log(`Deleted todo with id ${id}`)
    console.log("Remaining todos:", todoData)
    
    response.writeHead( 200, "OK", {"Content-Type": "application/json" })
    response.end( JSON.stringify(todoData) )
  } else {
    response.writeHead( 400, "Bad Request", {"Content-Type": "text/plain" })
    response.end("Missing id parameter")
  }
}

const sendFile = function( response, filename ) {
   const type = mime.getType( filename ) 

   fs.readFile( filename, function( err, content ) {

     // if the error = null, then we"ve loaded the file successfully
     if( err === null ) {

       // status code: https://httpstatuses.com
       response.writeHeader( 200, { "Content-Type": type })
       response.end( content )

     }else{

       // file not found, error code 404
       response.writeHeader( 404 )
       response.end( "404 Error: File Not Found" )

     }
   })
}

server.listen( process.env.PORT || port )
