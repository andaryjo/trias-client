import { TRIASDeparturesHandler } from "./trias/TRIASDeparturesHandler";
import { TRIASStopsHandler } from "./trias/TRIASStopsHandler";

export const getClient = (options: ClientOptions) => {
    return new TRIASClient(options);
};

class TRIASClient {
    departuresHandler;
    stopsHandler;

    constructor(options: ClientOptions) {
        this.departuresHandler = new TRIASDeparturesHandler(options);
        this.stopsHandler = new TRIASStopsHandler(options);
    }

    getDepartures(options: DeparturesRequestOptions) {
        return this.departuresHandler.getDepartures(options);
    }

    getStops(options: StopsRequestOptions) {
        return this.stopsHandler.getStops(options);
    }
}
