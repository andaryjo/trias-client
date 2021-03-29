const trias = require("../lib/index.js");

if (process.env.TEST_CREDENTIALS) var creds = JSON.parse(process.env.TEST_CREDENTIALS);
else var creds = require("./test-credentials.json");

describe("Test providers", () => {

    const providers = [
        {
            "name": "KVV",
            "url": creds["KVV"].url,
            "requestorRef": creds["KVV"].token,
            "searchName": "karlsruhe"
        }, {
            "name": "VRN",
            "url": creds["VRN"].url,
            "requestorRef": creds["VRN"].token,
            "searchName": "bismarckplatz"
        }, {
            "name": "VRR",
            "url": creds["VRR"].url,
            "requestorRef": creds["VRR"].token,
            "searchName": "bahnhof"
        }, {
            "name": "VVO",
            "url": creds["VVO"].url,
            "requestorRef": creds["VVO"].token,
            "headers": { "Content-Type": "text/xml" },
            "searchName": "dresden",
        }
    ]

    for (const provider of providers) {

        it("Test for " + provider.name, async () => {

            const client = trias.getClient({
                url: provider.url,
                requestorRef: provider.requestorRef,
                headers: provider.headers
            });

            const stopsResult = await client.getStops({
                name: provider.searchName
            });

            expect(stopsResult.success).toEqual(true);
            expect(stopsResult.stops.length).toBeGreaterThanOrEqual(1);
            expect(stopsResult.stops[0].type).toEqual("stop");

            const departuresResult = await client.getDepartures({
                id: stopsResult.stops[0].id
            });

            expect(departuresResult.success).toEqual(true);
            expect(departuresResult.departures.length).toBeGreaterThanOrEqual(1);
            expect(departuresResult.departures[0].type).toEqual("stopover");

        });

    }

});