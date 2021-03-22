const PAYLOAD_LIR_NAME = require("../xml/TRIAS_LIR_NAME");
const PAYLOAD_LIR_POS = require("../xml/TRIAS_LIR_POS");

class TRIASStopsHandler {
    url;
    requestorRef;

    // This is my first TypeScript project. Don't judge me please!
    request = require("request");
    xmldom = require("xmldom");

    constructor(url: string, requestorRef: string) {
        this.url = url;
        this.requestorRef = requestorRef;
    }

    getStops(options: StopsRequestOptions) {
        return new Promise((resolve, reject) => {
            var maxResults = options.maxResults ? options.maxResults : 10;
            var payload;

            if (options.name)
                payload = PAYLOAD_LIR_NAME.replace("$QUERY", options.name)
                    .replace("$MAXRESULTS", maxResults.toString())
                    .replace("$TOKEN", this.requestorRef);
            else if (options.latitude && options.longitude && options.radius)
                payload = PAYLOAD_LIR_POS.replace("$LATITUDE", options.latitude.toString())
                    .replace("$LONGITUDE", options.longitude.toString())
                    .replace("$RADIUS", options.radius.toString())
                    .replace("$MAXRESULTS", maxResults.toString())
                    .replace("$TOKEN", this.requestorRef);

            var headers = { "Content-Type": "application/xml" };

            this.request.post({ url: this.url, body: payload, headers: headers }, (err: any, res: any, body: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (res.statusCode != 200) {
                    reject("API returned status code " + res.statusCode);
                    return;
                }

                body = this.sanitizeBody(body);

                var stops: Array<FPTFStop> = [];

                try {
                    var doc = new this.xmldom.DOMParser().parseFromString(body);
                    var locationsList = doc.getElementsByTagName("LocationResult");

                    for (var i = 0; i < locationsList.length; i++) {
                        var locationElement = locationsList.item(i);
                        var id = locationElement.getElementsByTagName("StopPointRef").item(0).childNodes[0].nodeValue;
                        var latitude = parseFloat(
                            locationElement.getElementsByTagName("Latitude").item(0).childNodes[0].nodeValue,
                        );
                        var longitude = parseFloat(
                            locationElement.getElementsByTagName("Longitude").item(0).childNodes[0].nodeValue,
                        );

                        var stopPointNameElement = locationElement.getElementsByTagName("StopPointName").item(0);
                        var stationName = stopPointNameElement.getElementsByTagName("Text").item(0).childNodes[0]
                            .nodeValue;

                        var locationNameElement = locationElement.getElementsByTagName("LocationName").item(0);
                        var locationName = locationNameElement.getElementsByTagName("Text").item(0).childNodes[0]
                            .nodeValue;

                        if (!stationName.includes(locationName)) stationName = locationName + " " + stationName;

                        var stop: FPTFStop = {
                            type: "stop",
                            id: id,
                            name: stationName,
                            location: {
                                type: "location",
                                latitude: latitude,
                                longitude: longitude,
                            },
                        };

                        stops.push(stop);
                    }

                    var result: StopsResult = {
                        success: true,
                        stops: stops,
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
        if (body.includes("trias:")) body.replace(/trias:/g, "");
        return body;
    }
}

module.exports = TRIASStopsHandler;
