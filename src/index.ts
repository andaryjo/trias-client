export const getClient = (options: ClientOptions) => {
    return new TRIASClient(options);
}

class TRIASClient {

    constructor(options: ClientOptions) {
        
    }

    getStops(options: StopsRequestOptions) : Array<stop> {

        var stop1: stop = {
            type: "stop",
            id: "stop1",
            name: "Jägerhaus"
        }

        var stop2: stop = {
            type: "stop",
            id: "stop2",
            name: "Bismarckplatz"
        }

        return [stop1, stop2];

    }

}

