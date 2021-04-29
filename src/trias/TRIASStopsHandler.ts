import {requestAndParse, selectAll, selectOne, getText} from '../request-and-parse';
import { TRIAS_LIR_NAME } from "../xml/TRIAS_LIR_NAME";
import { TRIAS_LIR_POS } from "../xml/TRIAS_LIR_POS";

export class TRIASStopsHandler {
    url: string;
    requestorRef: string;
    headers: { [key: string]: string };

    constructor(url: string, requestorRef: string, headers: { [key: string]: string }) {
        this.url = url;
        this.requestorRef = requestorRef;
        this.headers = headers;
    }

    async getStops(options: StopsRequestOptions): Promise<StopsResult> {
        const maxResults = options.maxResults ? options.maxResults : 10;
        let payload;

        if (options.name)
            payload = TRIAS_LIR_NAME.replace("$QUERY", options.name)
                .replace("$MAXRESULTS", maxResults.toString())
                .replace("$TOKEN", this.requestorRef);
        else if (options.latitude && options.longitude && options.radius)
            payload = TRIAS_LIR_POS.replace("$LATITUDE", options.latitude.toString())
                .replace("$LONGITUDE", options.longitude.toString())
                .replace("$RADIUS", options.radius.toString())
                .replace("$MAXRESULTS", maxResults.toString())
                .replace("$TOKEN", this.requestorRef);
        else {
            throw new Error('options.name or options.{latitude,longitude} must be passed');
        }

        const doc = await requestAndParse(this.url, this.requestorRef, this.headers, payload);

        const stops: FPTFStop[] = [];

        for (const locationEl of selectAll('LocationResult', doc)) {

            const stop: FPTFStop = {
                type: "stop",
                id: "",
                name: "",
            };

            const id = getText(selectOne('StopPointRef', locationEl));
            if (id) stop.id = id;

            const latitude = getText(selectOne('Latitude', locationEl));
            const longitude = getText(selectOne('Longitude', locationEl));
            if (latitude && longitude) {
                stop.location = {
                    type: "location",
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude)
                };
            }

            const stationName = getText(selectOne('StopPointName Text', locationEl));
            const locationName = getText(selectOne('LocationName Text', locationEl));

            if (locationName && stationName && !stationName.includes(locationName)) stop.name = locationName + " " + stationName;
            else if (stationName) stop.name = stationName;

            stops.push(stop);
        }

        return {
            success: true,
            stops,
        };
    }
}
