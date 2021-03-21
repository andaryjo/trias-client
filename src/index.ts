const TRIASStopsHandler = require("./trias/TRIASStopsHandler");

export const getClient = (options: ClientOptions) => {
    return new TRIASClient(options);
}

class TRIASClient {

    stopsHandler;

    constructor(options: ClientOptions) {
        this.stopsHandler = new TRIASStopsHandler(options.url, options.requestorRef);
    }

    getStops(options: StopsRequestOptions) {
        return this.stopsHandler.getStops(options);
    }
}
