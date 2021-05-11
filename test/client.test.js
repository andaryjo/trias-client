/* eslint-disable @typescript-eslint/no-var-requires */
const moment = require("moment-timezone");
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
            journeyDestination: "de:08212:89"
        }, {
            name: "SBB",
            url: creds["SBB"].url,
            requestorRef: "trias-client",
            headers: { "Authorization": creds["SBB"].token },
            searchName: "messeplatz",
            journeyOrigin: "8500010", // Basel, Hbf
            journeyDestination: "8591442" // Zürich, Zoo
        }, {
            name: "VRN",
            url: creds["VRN"].url,
            requestorRef: creds["VRN"].token,
            searchName: "bismarckplatz",
            journeyOrigin: "de:08222:2432", // Mannheim, Lange Rötterstraße
            journeyVia: "de:08221:1146", // Heidelberg, Bismarckplatz
            journeyDestination: "de:08221:1283" // Heidelberg, Jägerhaus
        }, {
            name: "VRR",
            url: creds["VRR"].url,
            requestorRef: creds["VRR"].token,
            searchName: "bahnhof",
            journeyOrigin: "de:05314:63101",
            journeyDestination: "de:05382:55101"
        }, {
            name: "VST",
            url: creds["VST"].url,
            requestorRef: creds["VST"].token,
            searchName: "villach",
            journeyOrigin: "at:42:3654", // Villach, Hbf
            journeyDestination: "at:42:3642" // Klagenfurt, Hbf
        }, {
            name: "VVO",
            url: creds["VVO"].url,
            requestorRef: creds["VVO"].token,
            headers: { "Content-Type": "text/xml" },
            searchName: "dresden",
            journeyOrigin: "de:14612:28", // Dresden, Hbf
            journeyDestination: "de:14713:8010205" // Leipzig, Hbf
        }
    ]

    for (const provider of providers) {

        it("Test " + provider.name, async () => {

            const client = trias.getClient({
                url: provider.url,
                requestorRef: provider.requestorRef,
                headers: provider.headers
            });

            // Test stop search
            const stopsResult = await client.getStops({
                name: provider.searchName
            });

            expect(stopsResult.success).toEqual(true);
            expect(stopsResult.stops.length).toBeGreaterThanOrEqual(1);
            expect(stopsResult.stops[0].type).toEqual("stop");

            // Test departures (now)
            const departuresNowResult = await client.getDepartures({
                id: stopsResult.stops[0].id,
            });

            if (provider.name == "VRN") {
                console.log(JSON.stringify(departuresNowResult));
            }

            expect(departuresNowResult.success).toEqual(true);
            expect(departuresNowResult.departures.length).toBeGreaterThanOrEqual(1);
            expect(departuresNowResult.departures[0].type).toEqual("stopover");

            // Test departures (in 30 mins)
            const in30Mins = moment().unix() + 30 * 60;
            const departuresIn30MinsResult = await client.getDepartures({
                id: stopsResult.stops[0].id,
                time: moment.unix(in30Mins).format()
            });

            expect(departuresIn30MinsResult.success).toEqual(true);
            expect(departuresIn30MinsResult.departures.length).toBeGreaterThanOrEqual(1);
            expect(departuresIn30MinsResult.departures[0].type).toEqual("stopover");

            let firstDepartureTime = moment(departuresIn30MinsResult.departures[0].departure).unix();
            if (departuresIn30MinsResult.departures[0].departureDelay) firstDepartureTime += departuresIn30MinsResult.departures[0].departureDelay;
            expect(firstDepartureTime).toBeGreaterThanOrEqual(in30Mins - 60);

            // Test journeys
            const journeysResult = await client.getJourneys({
                origin: provider.journeyOrigin,
                destination: provider.journeyDestination,
                via: provider.journeyVia ? [provider.journeyVia] : [],
                includeFares: true
            });

            expect(journeysResult.success).toEqual(true);
            expect(journeysResult.journeys.length).toBeGreaterThanOrEqual(1);
            expect(journeysResult.journeys[0].type).toEqual("journey");
            expect(journeysResult.journeys[0]).toHaveProperty("tickets");

            const journey = journeysResult.journeys[0];
            expect(journey.legs[0].origin.type).toEqual("stop");
            expect(journey.legs[0].origin.id).toEqual(provider.journeyOrigin);
            expect(journey.legs[journey.legs.length - 1].destination.type).toEqual("stop");
            expect(journey.legs[journey.legs.length - 1].destination.id).toEqual(provider.journeyDestination);

            let viaIncluded = false;
            if (provider.via) {
                for (const leg of journey.legs) {
                    if ((leg.origin.type == "stop" && leg.origin.id == provider.via) || (leg.destination.type == "stop" && leg.destination.id == provider.via)) {
                        viaIncluded = true;
                    }
                }
            }

            expect(viaIncluded).toEqual(provider.via != null);

        });
    }
});