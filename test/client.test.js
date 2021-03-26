const trias = require("../lib/index.js");

if (process.env.TEST_CREDENTIALS) var creds = JSON.parse(process.env.TEST_CREDENTIALS);
else var creds = require("./test-credentials.json");

describe("Test client", () => {

    it("Test for VRN", async () => {

        const client = trias.getClient({
            url: creds["VRN"].url,
            requestorRef: creds["VRN"].token,
        });

        const stopsResult = await client.getStops({
            name: "bismarckplatz"
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

    it("Test for VRR", async () => {

        const client = trias.getClient({
            url: creds["VRR"].url,
            requestorRef: creds["VRR"].token,
        });

        const stopsResult = await client.getStops({
            name: "bahnhof"
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

    it("Test for KVV", async () => {

        const client = trias.getClient({
            url: creds["KVV"].url,
            requestorRef: creds["KVV"].token,
        });

        const stopsResult = await client.getStops({
            name: "karlsruhe"
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

    it("Test for VVO", async () => {

        const client = trias.getClient({
            url: creds["VVO"].url,
            requestorRef: creds["VVO"].token,
            headers: { "Content-Type": "text/xml" }
        });

        const stopsResult = await client.getStops({
            name: "dresden"
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

});