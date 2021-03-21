const trias = require("../lib/index.js");

var client = trias.getClient({url: "http://trias.vrn.de:8080/Middleware/Data/trias", requestorRef: "test"});

client.getStops({
    name: "bismarckplatz"
}).then((result) => {

    console.log(result);
    client.getDepartures({
        id: result.stops[0].id
    }).then((result) => {
        console.log(result);
    })

}).catch((error) => {
    console.log(error);
});