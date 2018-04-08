new Vue({
    el: '#application',
    data: {
        guiElements: {},
        guiElementsLanguages: [],
        languageButtons: [],
        todosList: [],
        paginationNumber: 1,
        paginationNext: false,
        newTodo: "",
        userToken: "",
        loggedIn: false,
        userName: "",
        userPassword: "",
        warning: false
    },
    methods: {
        logIn: function(event) {
            var user = {
                name: this.userName,
                password: this.userPassword
            }
            var token = this.serverRequest('get-token', JSON.stringify(user), this.authorization)
        },
        authorization: function(data) {
            if(data.length > 0) {
                this.userToken = data
                this.loggedIn = true
                this.loadTodos(1)
            } else {
                this.warning = this.guiElements.warning
            }
        },
        changeLanguage: function(event) {
            var button = this.languageButtons[event.target.value]
            this.languageButtons.splice(event.target.value, 1)
            this.languageButtons.unshift(button)
            for (var i = 0, languages = this.guiElementsLanguages.length; i < languages; i++) {
                if (this.guiElementsLanguages[i].language == button.name) {
                    this.guiElements = this.guiElementsLanguages[i]
                    break;
                }
            }
        },
        loadTodos: function(paginationNumber) {
            if (paginationNumber > 0 && paginationNumber <= this.paginationNumber + this.paginationNext) {
                var dataObject = { 'token': this.userToken, 'paginationNumber': paginationNumber}
                var todos = this.serverRequest('read-todo', JSON.stringify(dataObject), this.showTodos)
                this.todosList = todos
                this.paginationNumber = paginationNumber
            }
        },
        showTodos: function(httpData) {
            var todosToShow = JSON.parse(httpData)
            if (todosToShow.length == 4) {
                this.paginationNext = true
                todosToShow.pop()
            } else this.paginationNext = false

            this.todosList = todosToShow
        },
        addTodo: function() {
            if(this.newTodo.trim() != ""){
                var datetime = new Date();
                datetime = datetime.toLocaleString()
                var data = {
                    'token': this.userToken,
                    'id': null,
                    'datetime': datetime,
                    'text': this.newTodo
                }
                this.serverRequest('create-todo', JSON.stringify(data), null)
                this.newTodo = ""
                this.loadTodos(this.paginationNumber)
            }
        },
        editTodo: function(event) {
            event.target.parentElement.parentElement.firstChild.firstChild.readOnly = false
            event.target.className += ' d-none'
            event.target.parentElement.children[1].className += ' d-block'
        },
        saveTodo: function(event) {
            var id = event.target.value
            var todoToSend = this.todosList.find(function(el) {
                if (el.id == id) return true
                return false
            })
            var index = this.todosList.indexOf(todoToSend)
            if(this.todosList[index].text.trim() != ""){
                var dataObject = { 'token': this.userToken, 'id': this.todosList[index].id, 'datetime': this.todosList[index].datetime, 'text': this.todosList[index].text }
                this.serverRequest('update-todo', JSON.stringify(dataObject), null)
                this.loadTodos(this.paginationNumber)
            }
        },
        deleteTodo: function(event) {
            var dataObject = { 'token': this.userToken, 'id': event.target.value}
            this.serverRequest('delete-todo', JSON.stringify(dataObject), null)
            this.loadTodos(this.paginationNumber)
        },
        serverRequest: function(path, data, callback) {
            var xmlhttp = new XMLHttpRequest()
            xmlhttp.open("POST", "http://localhost:1234/" + path)
            xmlhttp.send(data)
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 && (xmlhttp.status == 200 || xmlhttp.status == 403)) {
                    var response = xmlhttp.responseText
                    if (callback != null) return callback(response)
                }
            }
        }
    },
    created: function() {
        this.languageButtons.push({
            name: 'en',
            content: '<img src="img/en.png">&nbsp;English'
        })
        this.languageButtons.push({
            name: 'pl',
            content: '<img src="img/pl.png">&nbsp;Polski'
        })
        this.guiElementsLanguages.push({
            language: 'en',
            newTodo: 'New todo',
            addButton: 'Add',
            yourTodos: 'Your todos',
            editButton: 'Edit',
            saveButton: 'Save',
            deleteButton: 'Delete',
            previousButton: 'Previous',
            nextButton: 'Next',
            userName: 'User name',
            password: 'Password',
            logIn: 'Log in',
            warning: 'Incorrect username or password'
        })
        this.guiElementsLanguages.push({
            language: 'pl',
            newTodo: 'Nowy',
            addButton: 'Dodaj',
            yourTodos: 'Lista',
            editButton: 'Edytuj',
            saveButton: 'Zapisz',
            deleteButton: 'Usuń',
            previousButton: 'Poprzednie',
            nextButton: 'Następne',
            userName: 'Użytkownik',
            password: 'Hasło',
            logIn: 'Zaloguj',
            warning: 'Nie poprawna nazwa użytkownika lub hasło'
        })
        this.guiElements = this.guiElementsLanguages[0]
    }
})
