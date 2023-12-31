const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");

const dbPath = path.join(__dirname, "todoApplication.db");
const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server starts .....");
    });
  } catch (err) {
    console.log(`Database Error: ${err.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

// ****** Scenario 3 *******
const hasPriorityAndStatus = (reqObject) => {
  return reqObject.priority !== undefined && reqObject.status !== undefined;
};
// ****** Scenario 5 *******
const hasCategoryAndStatus = (reqObject) => {
  return reqObject.category !== undefined && reqObject.status !== undefined;
};
// ****** Scenario 7 *******
const hasCategoryAndPriority = (reqObject) => {
  return reqObject.category !== undefined && reqObject.priority !== undefined;
};

// ****** Scenario 1 *******
const hasStatus = (reqObject) => {
  return reqObject.status !== undefined;
};
// ****** Scenario 2 *******
const hasPriority = (reqObject) => {
  return reqObject.priority !== undefined;
};
// ****** Scenario 6 *******
const hasCategory = (reqObject) => {
  return reqObject.category !== undefined;
};

// ****** Response Output ******
const outputResult = (dbResponse) => {
  return {
    id: dbResponse.id,
    todo: dbResponse.todo,
    priority: dbResponse.priority,
    status: dbResponse.status,
    category: dbResponse.category,
    dueDate: dbResponse.due_date,
  };
};

// API 1: Method: GET; Path: /todos/; Sample API: /todos/?status=TO%20DO
// (Returns a list of all todos whose status is 'TO DO')
// Response --
// [
//     {
//         "id": 2,
//         "todo": "Buy a Car",
//         "priority": "MEDIUM",
//         "status": "TO DO",
//         "category": "HOME",
//         "dueDate": "2021-09-22"
//     },
//     ...
// ]

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status, category } = request.query;

  switch (true) {
    // ****** Scenario 3 *******
    case hasPriorityAndStatus(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          const getTodosByPriorityAndStatus = `
                    SELECT
                        *
                    FROM
                        todo
                    WHERE
                        todo LIKE '%${search_q}%'
                        AND priority = '${priority}'
                        AND status = '${status}';
                  `;
          const todosArray = await db.all(getTodosByPriorityAndStatus);
          response.send(todosArray.map((eachTodo) => outputResult(eachTodo)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    // ****** Scenario 5 *******
    case hasCategoryAndStatus(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          const getTodosByCategoryAndStatus = `
                    SELECT
                        *
                    FROM
                        todo
                    WHERE
                        todo LIKE '%${search_q}%'
                        AND category = '${category}'
                        AND status = '${status}';
                  `;
          const todosArray = await db.all(getTodosByCategoryAndStatus);
          response.send(todosArray.map((eachTodo) => outputResult(eachTodo)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    // ****** Scenario 7 *******
    case hasCategoryAndPriority(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          const getTodosByCategoryAndPriority = `
                    SELECT
                        *
                    FROM
                        todo
                    WHERE
                        todo LIKE '%${search_q}%'
                        AND category = '${category}'
                        AND priority = '${priority}';
                  `;
          const todosArray = await db.all(getTodosByCategoryAndPriority);
          response.send(todosArray.map((eachTodo) => outputResult(eachTodo)));
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    // ****** Scenario 2 *******
    case hasPriority(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        const getTodosByPriority = `
                    SELECT
                        *
                    FROM
                        todo
                    WHERE
                        todo LIKE '%${search_q}%' 
                        AND priority = '${priority}';
                `;
        const todosArray = await db.all(getTodosByPriority);
        response.send(todosArray.map((eachTodo) => outputResult(eachTodo)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    // ****** Scenario 1 *******
    case hasStatus(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        const getTodosByStatus = `
                    SELECT
                        *
                    FROM
                        todo
                    WHERE
                        todo LIKE '%${search_q}%' 
                        AND status = '${status}';
                `;
        const todosArray = await db.all(getTodosByStatus);
        response.send(todosArray.map((eachTodo) => outputResult(eachTodo)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    // ****** Scenario 6 *******
    case hasCategory(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        const getTodosByCategory = `
                    SELECT
                        *
                    FROM
                        todo
                    WHERE
                        todo LIKE '%${search_q}%' 
                        AND category = '${category}';
                `;
        const todosArray = await db.all(getTodosByCategory);
        response.send(todosArray.map((eachTodo) => outputResult(eachTodo)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    // ******* Scenario 4 *******
    default:
      const getTodosBySearch_q = `
            SELECT
                *
            FROM
                todo
            WHERE
                todo LIKE '%${search_q}%';
          `;
      const todosArray = await db.all(getTodosBySearch_q);
      response.send(todosArray.map((eachTodo) => outputResult(eachTodo)));
      break;
  }
});

// API 2: Method: GET; Path: /todos/:todoId/; (Returns a specific todo based on the todo ID)
// Response --
// {
//  "id": 1,
//  "todo": "Learn Node JS",
//  "priority": "HIGH",
//  "status": "IN PROGRESS",
//  "category": "LEARNING",
//  "dueDate": "2021-03-16"
// }

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoByIdQuery = `
        SELECT
            *
        FROM
            todo
        WHERE
            id = ${todoId};
    `;
  const todoDetails = await db.get(getTodoByIdQuery);
  if (todoDetails === undefined) {
    response.status(400);
    response.send("Invalid Todo Id");
  } else {
    response.status(200);
    response.send(outputResult(todoDetails));
  }
});

// API 3: Method: GET; Path: /agenda/; (Returns a list of all todos with a specific due date in the query parameter /agenda/?date=2021-12-12)
// Response: **
// [
//  {
//  "id": 3,
//  "todo": "Clean the garden",
//  "priority": "LOW",
//  "status": "TO DO",
//  "category": "HOME",
//  "dueDate": "2021-12-12"
//  },
//      ...
// ]

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const isDateValid = isMatch(date, "yyyy-MM-dd");
  if (isDateValid === true) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    // console.log(newDate);
    const getTodosByDueDateQuery = `SELECT * FROM todo WHERE due_date = '${newDate}';`;
    const todosArray = await db.all(getTodosByDueDateQuery);
    // console.log(todosArray);
    if (todosArray.length !== 0) {
      response.status(200);
      response.send(todosArray.map((eachTodo) => outputResult(eachTodo)));
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

// API 4: Method: POST; Path: /todos/; (Create a todo in the todo table,)
// Response: **
// {
//  "id": 6,
//  "todo": "Finalize event theme",
//  "priority": "LOW",
//  "status": "TO DO",
//  "category": "HOME",
//  "dueDate": "2021-02-22"
// }

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "HOME" ||
        category === "WORK" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const newDate = format(new Date(dueDate), "yyyy-MM-dd");
          const createNewTodoQuery = `
            INSERT INTO
                todo (id, todo, priority, status, category, due_date)
            VALUES
                (
                    ${id},
                    '${todo}',
                    '${priority}',
                    '${status}',
                    '${category}',
                    '${newDate}'
                );
        `;
          await db.run(createNewTodoQuery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

// API 5: Method: PUT; Path: /todos/:todoId/; (Updates the details of a specific todo based on the todo ID)

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.due_date,
  } = request.body;
  let updateTodoQuery;
  switch (true) {
    // Scenario 1 ***** {"status": "DONE"}
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updateTodoQuery = `
                UPDATE
                    todo
                SET
                    todo = '${todo}',
                    priority = '${priority}',
                    status = '${status}',
                    category = '${category}',
                    due_date = '${dueDate}'
                WHERE
                    id = ${todoId};
            `;
        await db.run(updateTodoQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    // Scenario 2 ***** {"priority": "HIGH"}
    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        updateTodoQuery = `
                UPDATE
                    todo
                SET
                    todo = '${todo}',
                    priority = '${priority}',
                    status = '${status}',
                    category = '${category}',
                    due_date = '${dueDate}'
                WHERE
                    id = ${todoId};
            `;
        await db.run(updateTodoQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    // Scenario 3; {"todo": "Clean the garden"}
    case requestBody.todo !== undefined:
      updateTodoQuery = `
                UPDATE
                    todo
                SET
                    todo = '${todo}',
                    priority = '${priority}',
                    status = '${status}',
                    category = '${category}',
                    due_date = '${dueDate}'
                WHERE
                    id = ${todoId};
            `;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");
      break;

    // Scenario 4 ***** {"category": "LEARNING"}
    case requestBody.category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        updateTodoQuery = `
                UPDATE
                    todo
                SET
                    todo = '${todo}',
                    priority = '${priority}',
                    status = '${status}',
                    category = '${category}',
                    due_date = '${dueDate}'
                WHERE
                    id = ${todoId};
            `;
        await db.run(updateTodoQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    // Scenario 5 ***** {"dueDate": "2021-01-12"}
    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDueDate = format(new Date(dueDate), "yyyy-MM-dd");
        updateTodoQuery = `
                UPDATE
                    todo
                SET
                    todo = '${todo}',
                    priority = '${priority}',
                    status = '${status}',
                    category = '${category}',
                    due_date = '${newDueDate}'
                WHERE
                    id = ${todoId};
            `;
        await db.run(updateTodoQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});

// API 6: Method: DELETE; Path: /todos/:todoId/ (Deletes a todo from the todo table based on the todo ID)
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
        DELETE FROM
            todo
        WHERE
            id = ${todoId};
    `;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
module.exports = app;
