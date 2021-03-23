const trias = require("../lib/index.js");

describe("Test client", () => {

    var client = trias.getClient({
        url: process.env.TEST_TRIAS_URL, // URL for VRN Provider
        requestorRef: process.env.TEST_TRIAS_REF, // Requestor ref for VRN Provider
        headers: {"x-test-header": "test"}
    });

    it("should return stops by name", async () => {

        var stopsResult = await client.getStops({
            name: "bismarckplatz"
        });

        expect(stopsResult.success).toEqual(true);
        expect(stopsResult.stops.length).toBeGreaterThanOrEqual(1);
        expect(stopsResult.stops[0].type).toEqual("stop");
    });

    it("should return departures", async () => {

        var departuresResult = await client.getDepartures({
            id: "de:08221:1146" // Stop ID of "Bismarckplatz"
        });

        expect(departuresResult.success).toEqual(true);
        expect(departuresResult.departures.length).toBeGreaterThanOrEqual(1);
        expect(departuresResult.departures[0].type).toEqual("stopover");
    });
});