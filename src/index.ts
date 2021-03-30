import { TRIASDeparturesHandler } from "./trias/TRIASDeparturesHandler";
import { TRIASJourneysHandler } from "./trias/TRIASJourneysHandler";
import { TRIASStopsHandler } from "./trias/TRIASStopsHandler";

export const getClient = (options: ClientOptions) => {
    return new TRIASClient(options);
};

class TRIASClient {
    departuresHandler;
    journeysHandler;
    stopsHandler;

    constructor(options: ClientOptions) {
        if (!options.requestorRef) options.requestorRef = "";
        if (!options.headers) options.headers = {};

        this.departuresHandler = new TRIASDeparturesHandler(options.url, options.requestorRef, options.headers);
        this.journeysHandler = new TRIASJourneysHandler(options.url, options.requestorRef, options.headers);
        this.stopsHandler = new TRIASStopsHandler(options.url, options.requestorRef, options.headers);
    }

    getDepartures(options: DeparturesRequestOptions) {
        return this.departuresHandler.getDepartures(options);
    }

    getJourneys(options: JourneyRequestOptions) {
        return this.journeysHandler.getJourneys(options);
    }

    getStops(options: StopsRequestOptions) {
        return this.stopsHandler.getStops(options);
    }
}
