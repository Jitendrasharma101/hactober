// Get the DOM nodes
const submitTodoNode = document.getElementById("submitTodo");
const userInputNode = document.getElementById("userInput");
const prioritySelectorNode = document.getElementById("prioritySelector");
const todoPhotoPathNode = document.getElementById("todoPhoto");
const todoListNode = document.getElementById("todo-item");

// Listen to the click event of the submit button
submitTodoNode.addEventListener("click", function () {
  // Get the todo details from the input fields
  const todoText = userInputNode.value;
  const priority = prioritySelectorNode.value;
  const todoPhoto = todoPhotoPathNode.files[0];
  const completed=false;
  // Check if both fields are filled
  if (!todoText || !priority) {
    alert("Please enter a todo and select priority");
    return;
  }

  // Create a FormData object to send the data including the file
  const formData = new FormData();
  formData.append("todoText", todoText);
  formData.append("priority", priority);
  formData.append("todoPhoto", todoPhoto);
  formData.append("completed",completed);

  // Send the todo object to the server using fetch API
  fetch("/todo", {
    method: "POST",
    body: formData, // Use the FormData object
  })
    .then(function (response) {
      if (response.status === 200) {
        // Display the newly added todo in the UI
        return fetch("/todo-data");
      } else if (response.status === 401) {
        window.location.href = "/login";
      } else {
        throw new Error("Something went wrong while adding the todo");
      }
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (todos) {
      // Sort todos based on priority before displaying them
      const sortedTodos = sortTodosByPriority(todos);
      todoListNode.innerHTML = ""; // Clear the list before adding sorted todos
      sortedTodos.forEach(function (todo) {
        showTodoInUI(todo);
      });
    })
    .catch(function (error) {
      alert("Error: huehuehue " );
    });
});
function sortTodosByPriority(todos) {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return todos.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

// Function to display a todo in the UI
function showTodoInUI(todo) {
  const todoItemNode = document.createElement("li"); // Create a new todo item container
  todoItemNode.classList.add("todo-item");

  const todoTextContainer = document.createElement("div");
  todoTextContainer.classList.add("todo-text-container");

  const todoCheckbox = document.createElement("input");
  todoCheckbox.type = "checkbox";
  todoCheckbox.classList.add("todo-checkbox");
  todoCheckbox.checked = todo.completed; // Set the checkbox state based on the completed property

  const todoTextNode = document.createElement("span");
  todoTextNode.innerText = todo.todoText;
  todoTextNode.classList.add("todo-text");
  if (todo.completed) {
    todoTextNode.classList.add("completed"); // Add completed class to apply line-through style
  }

  todoTextContainer.appendChild(todoCheckbox);
  todoTextContainer.appendChild(todoTextNode);
  

  const todoImageContainer = document.createElement("div");
  todoImageContainer.classList.add("todo-image-container");

  const todoImage = document.createElement("img");
  todoImage.classList.add("todo-image");
  todoImage.src = todoPhoto ? todo.todoPhoto : placeholder.jpg; // Use actual image URL or placeholder

  todoImageContainer.appendChild(todoImage);



  const priorityContainer = document.createElement("div");
  priorityContainer.classList.add("priority-container");

  const priorityNode = document.createElement("span");
  priorityNode.innerText = todo.priority;
  priorityNode.classList.add("priority");

  priorityContainer.appendChild(priorityNode);

  const actionsContainer = document.createElement("div");
  actionsContainer.classList.add("actions-container");

  const deleteButtonNode = document.createElement("button");
  deleteButtonNode.innerHTML = "&#10060;"; // Cross symbol
  deleteButtonNode.classList.add("delete-btn");

  actionsContainer.appendChild(deleteButtonNode);

  todoItemNode.appendChild(todoTextContainer);
  todoItemNode.appendChild(priorityContainer);
  todoItemNode.appendChild(actionsContainer);
  todoItemNode.appendChild(todoImageContainer);
  todoListNode.appendChild(todoItemNode);

  // Checkbox event listener
  todoCheckbox.addEventListener("change", function () {
    todo.completed = this.checked;
    if (todo.completed) {
      todoTextNode.classList.add("completed");
    } else {
      todoTextNode.classList.remove("completed");
    }
    updateTodoOnServer(todo);
  });

  deleteButtonNode.addEventListener("click", function () {
    deleteTodoFromServer(todo, function (err) {
      if (err) {
        alert("Error occurred while deleting the todo.");
        return;
      }
      todoListNode.removeChild(todoItemNode);
    });
  });
}


// Fetch todos from the server when the page loads
fetch("/todo-data")
  .then(function (response) {
    if (response.ok) {
      return response.json();
    } else if (response.status === 401) {
      window.location.href = "/login";
    } else {
      throw new Error("Something went wrong while fetching todos");
    }
  })
  .then(function (todos) {
    // Display todos in the UI
    todos.forEach(function (todo) {
      showTodoInUI(todo);
    });
  })
  .catch(function (error) {
    alert("Error: "+ error);
  });

function updateTodoOnServer(todo) {
  fetch("/update-todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ todo, action: "update" }),
  })
    .then(function (response) {
      if (!response.ok) {
        alert("Error occurred while updating the todo.");
      }
    })
    .catch(function (error) {
      alert("Something went wrong: " + error.message);
    });
}

function deleteTodoFromServer(todo, callback) {
  fetch("/update-todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ todo, action: "delete" }),
  })
    .then(function (response) {
      if (!response.ok) {
        callback(new Error("Error occurred while deleting the todo."));
        return;
      }
      callback(null);
    })
    .catch(function (error) {
      callback(error);
    });
}


