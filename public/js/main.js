// FRONT-END (CLIENT) JAVASCRIPT HERE

let currentTodos = []

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  const taskInput = document.querySelector( "#task" ),
        priorityInput = document.querySelector( "#priority" ),
        dateInput = document.querySelector( "#creation_date" )
        
  const json = { 
    task: taskInput.value,
    priority: priorityInput.value,
    creation_date: dateInput.value
  }
  
  const body = JSON.stringify( json )

  try {
    const response = await fetch( "/submit", {
      method:"POST",
      body 
    })

    if (response.ok) {
      const updatedTodos = await response.json()
      currentTodos = updatedTodos
      displayTodos()
      
      // Clear the form
      taskInput.value = ""
      priorityInput.value = ""
      // Assumes that the user will want to use the same date for the next task;
      // After testing, I felt that this made more sense than completely clearing this field
      dateInput.value = dateInput.value
      
      console.log( "To-do added successfully!" )
    } else {
      console.error("Error adding to-do")
    }
  } catch (error) {
    console.error("Error:", error)
  }
}

const deleteTodo = async function(id) {
  try {
    const response = await fetch(`/todos?id=${id}`, {
      method: "DELETE"
    })
    
    if (response.ok) {
      const updatedTodos = await response.json()
      currentTodos = updatedTodos
      displayTodos()
      console.log(`Todo ${id} deleted successfully!`)
    } else {
      console.error("Error deleting todo")
    }
  } catch (error) {
    console.error("Error:", error)
  }
}

const displayTodos = function() {
  const tbody = document.querySelector("#todo-list")
  
  if (currentTodos.length === 0) {
    tbody.innerHTML = "<tr><td colspan='6'>No todos yet. Add one above!</td></tr>"
    return
  }
  
  tbody.innerHTML = currentTodos.map(todo => `
    <tr>
      <td>${todo.id}</td>
      <td>${todo.task}</td>
      <td><span class="priority-${todo.priority}">${todo.priority}</span></td>
      <td>${todo.creation_date}</td>
      <td>${todo.deadline}</td>
      <td>
        <button onclick="deleteTodo(${todo.id})" class="delete-btn">Delete</button>
      </td>
    </tr>
  `).join("")
}

const loadTodos = async function() {
  try {
    const response = await fetch("/todos")
    if (response.ok) {
      currentTodos = await response.json()
      displayTodos()
    } else {
      console.error("Error loading todos")
    }
  } catch (error) {
    console.error("Error:", error)
  }
}

window.onload = function() {
  const form = document.querySelector("#todo-form")
  form.onsubmit = submit
  
  // Set default date to today
  const dateInput = document.querySelector("#creation_date")
  const today = new Date().toISOString().split('T')[0]
  dateInput.value = today
  
  // Load existing todos when page loads
  loadTodos()
}