import axios from 'axios';
import * as moment from "moment-timezone";
import * as xmldom from "xmldom";

import { TRIAS_TR } from "../xml/TRIAS_TR";

export class TRIASDeparturesHandler {
    url: string;
    requestorRef: string;
    headers: { [key: string]: string };

    constructor(url: string, requestorRef: string, headers: { [key: string]: string }) {
        this.url = url;
        this.requestorRef = requestorRef;
        this.headers = headers;
    }

    getDepartures(options: TripsRequestOptions) {
        return new Promise((resolve, reject) => {
            const maxResults = options.maxResults ? options.maxResults : 20;

            let arrTime, depTime;
            if (options.arrivalTime) arrTime = moment(options.arrivalTime).tz("Europe/Berlin").format("YYYY-MM-DDTHH:mm:ss");
            else if (options.departureTime) depTime = moment().tz("Europe/Berlin").format("YYYY-MM-DDTHH:mm:ss");

            const payload = TRIAS_TR.replace("$ORIGIN", options.origin)
                .replace("$DESTINATION", options.destination)
                .replace("$DEPTIME", depTime ? depTime : "")
                .replace("$ARRTIME", arrTime ? arrTime : "")
                .replace("$MAXRESULTS", maxResults.toString())
                .replace("$TOKEN", this.requestorRef);

            if (!this.headers["Content-Type"]) this.headers["Content-Type"] = "application/xml";

            axios.post(this.url, payload, { headers: this.headers }).then((response) => {

                const body = this.sanitizeBody(response.data);

                const trips: FPTFJourney[] = [];

                try {

                    const doc = new xmldom.DOMParser().parseFromString(body);
                    var tripsList = doc.getElementsByTagName("Trip");

                    for (var i = 0; i < tripsList.length; i++) {

                        const tripElement = tripsList[i];
                        const tripID = tripElement.getElementsByTagName("ResultId")[0].childNodes[0].nodeValue;
                        const legsList = tripElement.getElementsByTagName("TripLeg");

                        for (var j = 0; j < legsList.length; j++) {

                            const leg: FPTFLeg = {
                                line: {
                                    type: "line",
                                    id: "",
                                    line: "",
                                    mode: FPTFMode.UNKNOWN
                                },
                                origin: "",
                                destination: "",
                                departure: "",
                                arrival: ""
                            }

                            var legElement = legsList[j];
                            if (legElement.getElementsByTagName("TimedLeg").length > 0) {

                                const origin: FPTFStop = {
                                    type: "stop",
                                    id: "",
                                    name: ""
                                }

                                const legBoardElement = legElement.getElementsByTagName("LegBoard")[0];
                                const startStationID = legBoardElement?.getElementsByTagName("StopPointRef")[0]?.childNodes[0]?.nodeValue;
                                if (startStationID) origin.id = this.parseStationID(startStationID);

                                origin.name = legBoardElement?.getElementsByTagName("StopPointName")[0]?.getElementsByTagName("Text")[0]?.childNodes[0]?.nodeValue?;
                                step.startTime = parseResponseTime(legBoardElement.getElementsByTagName("TimetabledTime")[0].childNodes[0].nodeValue);
                                if (legBoardElement.getElementsByTagName("EstimatedTime").length > 0) step.startRealtime = parseResponseTime(legBoardElement.getElementsByTagName("EstimatedTime")[0].childNodes[0].nodeValue);
                                if (legBoardElement.getElementsByTagName("PlannedBay").length > 0) step.startLocation.platform = this.parsePlatform(legBoardElement.getElementsByTagName("PlannedBay")[0].getElementsByTagName("Text")[0].childNodes[0].nodeValue);

                            var legAlightElement = legElement.getElementsByTagName("LegAlight")[0];
                            step.endLocation.type = "STATION";
                            step.endLocation.stationID = this.parseStationID(legAlightElement.getElementsByTagName("StopPointRef")[0].childNodes[0].nodeValue);
                            step.endLocation.name = legAlightElement.getElementsByTagName("StopPointName")[0].getElementsByTagName("Text")[0].childNodes[0].nodeValue;
                            step.endTime = parseResponseTime(legAlightElement.getElementsByTagName("TimetabledTime")[0].childNodes[0].nodeValue);
                            if (legAlightElement.getElementsByTagName("EstimatedTime").length > 0) step.endRealtime = parseResponseTime(legAlightElement.getElementsByTagName("EstimatedTime")[0].childNodes[0].nodeValue);
                            if (legAlightElement.getElementsByTagName("PlannedBay").length > 0) step.endLocation.platform = this.parsePlatform(legAlightElement.getElementsByTagName("PlannedBay")[0].getElementsByTagName("Text")[0].childNodes[0].nodeValue);

                            var pubLineNameTextElement = legElement.getElementsByTagName("PublishedLineName").item(0).getElementsByTagName("Text").item(0);
                            if (pubLineNameTextElement.childNodes.length > 0) step.line = this.parseLine(pubLineNameTextElement.childNodes[0].nodeValue);
                            else step.line = this.parseLine(legElement.getElementsByTagName("Name").item(0).getElementsByTagName("Text").item(0).childNodes[0].nodeValue);

                            step.direction = legElement.getElementsByTagName("DestinationText")[0].getElementsByTagName("Text")[0].childNodes[0].nodeValue;

                            var mode = legElement.getElementsByTagName("PtMode")[0].childNodes[0].nodeValue;
                            if (mode == "tram") step.mode = "TRAM";
                            else if (mode == "rail") step.mode = "TRAIN";
                            else step.mode = "BUS";

                        } else if (legElement.getElementsByTagName("ContinuousLeg").length > 0 || legElement.getElementsByTagName("InterchangeLeg").length > 0) {

                            var legStartElement = legElement.getElementsByTagName("LegStart")[0];
                            step.startLocation.type = "LOCATION";
                            step.startLocation.name = legStartElement.getElementsByTagName("LocationName")[0].getElementsByTagName("Text")[0].childNodes[0].nodeValue;
                            if (legStartElement.getElementsByTagName("GeoPosition").length > 0) {
                                step.startLocation.latitude = legStartElement.getElementsByTagName("Latitude")[0].childNodes[0].nodeValue;
                                step.startLocation.longitude = legStartElement.getElementsByTagName("Longitude")[0].childNodes[0].nodeValue;
                            }
                            if (legStartElement.getElementsByTagName("StopPointRef").length > 0) {
                                step.startLocation.stationID = this.parseStationID(legStartElement.getElementsByTagName("StopPointRef")[0].childNodes[0].nodeValue);
                                step.startLocation.type = "STATION";
                            }

                            var legEndElement = legElement.getElementsByTagName("LegEnd")[0];
                            step.endLocation.type = "LOCATION";
                            step.endLocation.name = legEndElement.getElementsByTagName("LocationName")[0].getElementsByTagName("Text")[0].childNodes[0].nodeValue;
                            if (legEndElement.getElementsByTagName("GeoPosition").length > 0) {
                                step.endLocation.latitude = legEndElement.getElementsByTagName("Latitude")[0].childNodes[0].nodeValue;
                                step.endLocation.longitude = legEndElement.getElementsByTagName("Longitude")[0].childNodes[0].nodeValue;
                            }
                            if (legEndElement.getElementsByTagName("StopPointRef").length > 0) {
                                step.endLocation.stationID = this.parseStationID(legEndElement.getElementsByTagName("StopPointRef")[0].childNodes[0].nodeValue);
                                step.endLocation.type = "STATION";
                            }

                            step.startTime = parseResponseTime(legElement.getElementsByTagName("TimeWindowStart")[0].childNodes[0].nodeValue);
                            step.endTime = parseResponseTime(legElement.getElementsByTagName("TimeWindowEnd")[0].childNodes[0].nodeValue);
                            step.mode = "WALK";

                        }

                        trip.steps.push(step);

                    }

                    trips.push(trip);

                }


                } catch (error) {
                    reject("The client encountered an error during parsing: " + error);
                    return;
                }

            }).catch((error) => {
                reject(error);
            });
        });
    }

    parseStationID(id: string) {
        if (!id.includes(":")) return id;
        var t = id.split(":");
        return t[0] + ":" + t[1] + ":" + t[2];
    }

    parseResponseTime(time: string) {
        return moment(time).tz("Europe/Berlin").format();
    }

    // Some providers include XML tags like "<trias:Result>"
    // This function removes them from the body before parsing
    sanitizeBody(body: string) {
        if (body.includes("trias:")) body = body.replace(/trias:/g, "");
        return body;
    }
}
