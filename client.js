const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader")
const packageDef = protoLoader.loadSync("todo.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef)
const todoPackage = grpcObject.todoPackage;

// add todos as command line arguments
const text = process.argv[2];

const client = new todoPackage.Todo("localhost:40000", grpc.credentials.createInsecure())

client.createTodo({"text": text}, (err, response) => {
    console.log("Created todo...", JSON.stringify(response.text))
});

// client.readTodos({}, (err, response) => {
//     if (!response.items)
//         response.items.forEach(i => { console.log(i.text) });
// })

const call = client.readTodosStream()
call.on("data", item => {
    console.log("Received item from server....", JSON.stringify(item));
});

// define the end protocol when the server ends the communication
call.on("end", e => console.log("server done!"));