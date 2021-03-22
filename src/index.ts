const TRIASDeparturesHandler = require("./trias/TRIASDeparturesHandler");
const TRIASStopsHandler = require("./trias/TRIASStopsHandler");

export const getClient = (options: ClientOptions) => {
    return new TRIASClient(options);
};

class TRIASClient {
    departuresHandler;
    stopsHandler;

    constructor(options: ClientOptions) {
        this.departuresHandler = new TRIASDeparturesHandler(options.url, options.requestorRef);
        this.stopsHandler = new TRIASStopsHandler(options.url, options.requestorRef);
    }

    getDepartures(options: DeparturesRequestOptions) {
        return this.departuresHandler.getDepartures(options);
    }

    getStops(options: StopsRequestOptions) {
        return this.stopsHandler.getStops(options);
    }
}
