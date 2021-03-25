import * as request from "request";
import * as xmldom from "xmldom";

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

            this.headers["Content-Type"] = "application/xml";

            request.post({ url: this.url, body: payload, headers: this.headers }, (err: any, res: any, body: any) => {

                if (err) {
                    reject(err);
                    return;
                }

                if (res.statusCode !== 200) {
                    reject("API returned status code " + res.statusCode);
                    return;
                }



                body = this.sanitizeBody(body);

                console.log(body);

                const stops: FPTFStop[] = [];

                try {
                    const doc = new xmldom.DOMParser().parseFromString(body);
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
            });
        });
    }

    // Some providers include XML tags like "<trias:Result>"
    // This function removes them from the body before parsing
    sanitizeBody(body: string) {
        if (body.includes("trias:")) body = body.replace(/trias:/g, "");
        return body;
    }
}
