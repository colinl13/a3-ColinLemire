// FRONT-END (CLIENT) JAVASCRIPT HERE

let currentTodos = []
let editingId = null

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  console.log("Form submitted!")
  
  const taskInput = document.querySelector( "#task" ),
        priorityInput = document.querySelector( "#priority" ),
        dateInput = document.querySelector( "#creation_date" )
        
  const json = { 
    task: taskInput.value,
    priority: priorityInput.value,
    creation_date: dateInput.value
  }
  
  console.log("Form data:", json)
  
  const body = JSON.stringify( json )

  try {
    let response

    // If editingID is set, then the form knows to edit the to-do instead of making a new one
    if (editingId !== null) {
      response = await fetch( `/todos/${editingId}` , {
        method:"PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body 
      })
    } else { // If editing ID is not set, then the form will make a new to-do
      response = await fetch( "/todos", {
        method:"POST",
        headers: {
          "Content-Type": "application/json"
        },
        body 
      })
    }

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
      
      // Set editing ID to null to reset form
      editingId = null
      const submitButton = document.querySelector('#todo-form button[type="submit"]')
      if (submitButton) 
        submitButton.textContent = 'Add To-do'
      
      console.log( "To-do saved successfully!" )
    } else if (response.status === 401) {
      // If somehow a user is able to access without being logged in, inform them they need to log in
      alert('Please log in to manage your to-dos.')
    } else {
      console.error("Error saving to-do")
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
    } else if (response.status === 401) {
      alert('User not logged in')
    } else {
      console.error("Error deleting todo")
    }
  } catch (error) {
    console.error("Error:", error)
  }
}

const startEdit = function(id) {
  const todo = currentTodos.find(t => t.id === id)
  if (!todo) {
    console.log(`Cannot find to-do with ID ${id}`)
    return
  }

  // Set the forms values to the values of the selected to-do
  const taskInput = document.querySelector( "#task" ),
        priorityInput = document.querySelector( "#priority" ),
        dateInput = document.querySelector( "#creation_date" )
        
  taskInput.value = todo.task
  priorityInput.value = todo.priority
  dateInput.value = todo.creation_date
  editingId = id

  const submitBtn = document.querySelector('#todo-form button[type="submit"]')
  if (submitBtn) 
    submitBtn.textContent = 'Update To-do'
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
        <button onclick="startEdit(${todo.id})" class="btn btn-sm btn-secondary me-2">Edit</button>
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
    } else if (response.status === 401) {
      // Not logged in: show empty state
      currentTodos = []
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

  // Make login and logout buttons
  const loginButton = document.querySelector('#login-button')
  const logoutButton = document.querySelector('#logout-button')
  const loginMessage = document.querySelector('#login-message')

  fetch('/api/auth-status')
    .then(r => r.json())
    .then(({ authenticated }) => {
      if (authenticated) {
        if (logoutButton) 
          logoutButton.style.display = 'inline-block'
        if (loginButton) 
          loginButton.style.display = 'none'
        if (loginMessage)
          loginMessage.style.display = 'none'
      } else {
        if (loginButton) 
          loginButton.style.display = 'inline-block'
        if (logoutButton) 
          logoutButton.style.display = 'none'
        if (loginMessage)
          loginMessage.style.display = 'center'
      }
    })

  if (loginButton) {
    loginButton.onclick = () => {
      window.location.href = '/login'
    }
  }
  if (logoutButton) {
    logoutButton.onclick = () => {
      window.location.href = '/logout'
    }
  }
}

// expose startEdit for inline onclick
window.startEdit = startEdit