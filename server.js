const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader")
const packageDef = protoLoader.loadSync("todo.proto", {});

// load the package definition into a gRPC object to obtain the package, todoPackage
const grpcObject = grpc.loadPackageDefinition(packageDef)

// get the todoPackage
const todoPackage = grpcObject.todoPackage;

// create a server
const server = new grpc.Server();

// bind the server to address 0.0.0.0:40000
// gRPC allows bypassing of credentials through grpc.ServerCredentials.createInsecure
server.bind("0.0.0.0:40000", grpc.ServerCredentials.createInsecure());

// Add service to server
// The methods have to be mapped to the server (methods existing on this file)
server.addService(todoPackage.Todo.service,
    { 
        "createTodo": createTodo,
        "readTodos": readTodos,
        "readTodosStream": readTodosStream,
    });

// to store the todos
const todos = []

function createTodo (call, callback) {
    const todoItem = {
        "id": todos.length + 1,
        "text": call.request.text
    }
    todos.push(todoItem);

    callback(null, todoItem);
}
function readTodos (call, callback) {
    callback(null, {"items": todos})
}

// ideal scenario: stream todos instead of sending them back to client all at once
function readTodosStream(call, callback){
    todos.forEach(todo => call.write(todo));
    call.end(); //end communication between the client and the server
} 

server.start();