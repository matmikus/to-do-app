var http = require('http')
var url = require('url')
var fs = require('fs')

const USER_NAME = "kotrak"
const USER_PASSWORD = "kotrak"

var todosList = JSON.parse(fs.readFileSync('database.json', 'utf8'));
var userToken;

function saveTodosToJSONFile() {
    fs.writeFile("database.json", JSON.stringify(todosList), 'utf8', function(err) {
        if (err) {
            return console.log(err);
        }
        console.log("Todos was saved in the JSON file");
    });
}

var httpServer = http.createServer(function(request, response) {
    var path = url.parse(request.url).pathname;
    if (path == '/get-token') {
        request.on('data', function(requestData) {
            var client = JSON.parse(requestData)
            if (client.name == USER_NAME && client.password == USER_PASSWORD) {
                var newToken = Math.random().toString().substr(2)
                userToken = newToken
                response.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                response.end(newToken)
            } else {
                response.writeHead(403);
                response.end()
            }
        });
    } else if (path == '/create-todo') {
        request.on('data', function(requestData) {
            var newTodoData = JSON.parse(requestData)
            if (newTodoData.token == userToken) {
                var newTodo = { 'datetime': newTodoData.datetime, 'text': newTodoData.text }
                if(todosList.length > 0) newTodo.id = todosList[todosList.length - 1].id + 1
                else newTodo.id = 1
                todosList.push(newTodo)
                saveTodosToJSONFile()
                response.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                response.end()
            } else {
                response.writeHead(403);
                response.end()
            }
        });
    } else if (path == '/read-todo') {
        request.on('data', function(requestData) {
            var dataObject = JSON.parse(requestData)
            if (dataObject.token == userToken) {
                var todosToSend = []
                var rangeFrom = 3 * (dataObject.paginationNumber - 1)
                var rangeTo = rangeFrom + 3
                for (var i = rangeFrom; i < todosList.length && i <= rangeTo; i++) todosToSend.push(todosList[i])
                response.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                response.end(JSON.stringify(todosToSend))
            } else {
                response.writeHead(403);
                response.end()
            }

        });
    } else if (path == '/update-todo') {
        request.on('data', function(requestData) {
            var updatedTodo = JSON.parse(requestData)
            if (updatedTodo.token == userToken) {
                var todoToEdit = todosList.find(function(el) {
                    if (el.id == updatedTodo.id) return true
                    return false
                })
                todosList[todosList.indexOf(todoToEdit)].text = updatedTodo.text
                saveTodosToJSONFile()
                response.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                response.end()
            } else {
                response.writeHead(403);
                response.end()
            }
        });
    } else if (path == '/delete-todo') {
        request.on('data', function(requestData) {
            var deletedTodo = JSON.parse(requestData)
            if (deletedTodo.token == userToken) {
                var todoToDelete = todosList.find(function(el) {
                    if (el.id == deletedTodo.id) return true
                    return false
                })
                todosList.splice(todosList.indexOf(todoToDelete), 1)
                saveTodosToJSONFile()
                response.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                response.end()
            } else {
                response.writeHead(403);
                response.end()
            }
        });
    }
}).listen(1234);
console.log('HTTP server for AJAX initialized');
