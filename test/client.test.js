/* eslint-disable @typescript-eslint/no-var-requires */
const trias = require("../lib/index.js");

const creds = process.env.TEST_CREDENTIALS
    ? JSON.parse(process.env.TEST_CREDENTIALS)
    : require("./test-credentials.json");

describe("Test providers", () => {

    jest.setTimeout(10000);

    const providers = [
        {
            name: "KVV",
            url: creds["KVV"].url,
            requestorRef: creds["KVV"].token,
            searchName: "karlsruhe",
            journeyOrigin: "de:08212:1103",
            journeyDestination: "de:08212:90"
        }, {
            name: "VRN",
            url: creds["VRN"].url,
            requestorRef: creds["VRN"].token,
            searchName: "bismarckplatz",
            journeyOrigin: "de:08222:2417",
            journeyDestination: "de:08221:1146"
        }, {
            name: "VRR",
            url: creds["VRR"].url,
            requestorRef: creds["VRR"].token,
            searchName: "bahnhof",
            journeyOrigin: "de:05314:63101",
            journeyDestination: "de:05382:55101"
        }, {
            name: "VVO",
            url: creds["VVO"].url,
            requestorRef: creds["VVO"].token,
            headers: { "Content-Type": "text/xml" },
            searchName: "dresden",
            journeyOrigin: "de:14612:28",
            journeyDestination: "de:14713:8010205"
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

            const journeysResult = await client.getJourneys({
                origin: provider.journeyOrigin,
                destination: provider.journeyDestination
            });

            expect(journeysResult.success).toEqual(true);
            expect(journeysResult.journeys.length).toBeGreaterThanOrEqual(1);
            expect(journeysResult.journeys[0].type).toEqual("journey");

        });
    }
});