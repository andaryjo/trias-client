const trias = require("../lib/index.js");

var client = trias.getClient({url: "test", requestorRef: "test"});

console.log(client.getStops({
    name: "test"
}));