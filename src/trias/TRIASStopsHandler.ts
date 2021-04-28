import {requestAndParse} from '../request-and-parse';
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

    getStops(options: StopsRequestOptions) {
        return new Promise((resolve, reject) => {
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
                reject('options.name or options.{latitude,longitude} must be passed');
                return;
            }

            requestAndParse(this.url, this.requestorRef, this.headers, payload)
            .then((doc) => {

                const stops: FPTFStop[] = [];

                try {
                    const locationsList = doc.getElementsByTagName("LocationResult");

                    for (let i = 0; i < locationsList.length; i++) {

                        const stop: FPTFStop = {
                            type: "stop",
                            id: "",
                            name: "",
                        };

                        const locationElement = locationsList.item(i);

                        const id = locationElement?.getElementsByTagName("StopPointRef")?.item(0)?.childNodes[0].nodeValue;
                        if (id) stop.id = id;

                        const latitude = locationElement?.getElementsByTagName("Latitude")?.item(0)?.childNodes[0]?.nodeValue;
                        const longitude = locationElement?.getElementsByTagName("Longitude")?.item(0)?.childNodes[0]?.nodeValue;
                        if (latitude && longitude) {
                            stop.location = {
                                type: "location",
                                latitude: parseFloat(latitude),
                                longitude: parseFloat(longitude)
                            };
                        }

                        const stationName = locationElement?.getElementsByTagName("StopPointName")?.item(0)?.getElementsByTagName("Text")?.item(0)?.childNodes[0].nodeValue;
                        const locationName = locationElement?.getElementsByTagName("LocationName")?.item(0)?.getElementsByTagName("Text")?.item(0)?.childNodes[0].nodeValue;

                        if (locationName && stationName && !stationName.includes(locationName)) stop.name = locationName + " " + stationName;
                        else if (stationName) stop.name = stationName;

                        stops.push(stop);
                    }

                    const result: StopsResult = {
                        success: true,
                        stops,
                    };

                    resolve(result);
                } catch (error) {
                    reject("The client encountered an error during parsing: " + error);
                    return;
                }
            }).catch((error) => {
                reject(error);
            });
        });
    }
}
