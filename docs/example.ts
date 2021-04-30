import { inspect } from "util";
import { getClient } from ".";

const sbbProfile = {
    // Test environment of SBB
    // See here: https://opentransportdata.swiss/de/cookbook/abfahrts-ankunftsanzeiger/
    url: "https://api.opentransportdata.swiss/trias2020",
    requestorRef: "trias-client",
    headers: {
        authorization: "57c5dbbbf1fe4d000100001842c323fa9ff44fbba0b9b925f0c052d1",
    }
};

const zürich = "8503000";
const luzern = "8505000";
const aarau = "8502113";

const client = getClient(sbbProfile);

// To Do: Add examples for station search and departures

async () => {
    const journeys = await client.getJourneys({
        origin: zürich,
        destination: luzern,
        via: [aarau],
        departureTime: "2021-05-20T14:00+02:00",
        maxResults: 2,
        includeFares: true,
    });

    console.log(inspect(journeys, { depth: null, colors: true }));
};
