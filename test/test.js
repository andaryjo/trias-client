const trias = require("../lib/index.js");

const conf = require("./config.json");

var client = trias.getClient({url: conf.url, requestorRef: conf.ref});

client.getStops({
    name: "bismarckplatz"
}).then((result) => {

    console.log(result);
    client.getDepartures({
        id: result.stops[0].id
    }).then((result) => {
        console.log(result.departures[0]);
    })

}).catch((error) => {
    console.log(error);
});