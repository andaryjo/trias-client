import * as moment from "moment-timezone";

import {requestAndParse} from '../request-and-parse';
import { TRIAS_TR } from "../xml/TRIAS_TR";

export class TRIASJourneysHandler {
    url: string;
    requestorRef: string;
    headers: { [key: string]: string };

    constructor(url: string, requestorRef: string, headers: { [key: string]: string }) {
        this.url = url;
        this.requestorRef = requestorRef;
        this.headers = headers;
    }

    getJourneys(options: JourneyRequestOptions) {
        return new Promise((resolve, reject) => {
            const maxResults = options.maxResults ? options.maxResults : 5;

            let arrTime; let depTime;
            if (options.arrivalTime) arrTime = this.parseRequestTime(options.arrivalTime);
            else if (options.departureTime) depTime = this.parseRequestTime(options.departureTime);

            const payload = TRIAS_TR.replace("$ORIGIN", options.origin)
                .replace("$DESTINATION", options.destination)
                .replace("$DEPTIME", depTime ? depTime : "")
                .replace("$ARRTIME", arrTime ? arrTime : "")
                .replace("$MAXRESULTS", maxResults.toString())
                .replace("$TOKEN", this.requestorRef);

            requestAndParse(this.url, this.requestorRef, this.headers, payload)
            .then((doc) => {

                const trips: FPTFJourney[] = [];

                try {

                    const tripsList = doc.getElementsByTagName("Trip");

                    for (let i = 0; i < tripsList.length; i++) {

                        const trip: FPTFJourney = {
                            type: "journey",
                            id: "",
                            legs: []
                        }

                        const tripElement = tripsList[i];

                        const tripID = tripElement.getElementsByTagName("TripId")[0].childNodes[0].nodeValue;
                        if (tripID) trip.id = tripID;

                        const legsList = tripElement.getElementsByTagName("TripLeg");

                        for (let j = 0; j < legsList.length; j++) {

                            const leg: FPTFLeg = {
                                mode: FPTFMode.UNKNOWN,
                                direction: "",
                                origin: "",
                                destination: "",
                                departure: "",
                                arrival: ""
                            }

                            const legElement = legsList[j];
                            if (legElement.getElementsByTagName("TimedLeg").length > 0) {

                                const origin: FPTFStop = {
                                    type: "stop",
                                    id: "",
                                    name: ""
                                }

                                const legBoardElement = legElement.getElementsByTagName("LegBoard")[0];

                                const startStationID = legBoardElement.getElementsByTagName("StopPointRef")[0].childNodes[0].nodeValue;
                                if (startStationID) origin.id = this.parseStationID(startStationID);

                                const startStationName = legBoardElement.getElementsByTagName("StopPointName")[0].getElementsByTagName("Text")[0].childNodes[0].nodeValue;
                                if (startStationName) origin.name = startStationName;

                                const startTime = legBoardElement.getElementsByTagName("TimetabledTime")[0].childNodes[0].nodeValue;
                                if (startTime) leg.departure = this.parseResponseTime(startTime);

                                if (legBoardElement.getElementsByTagName("EstimatedTime").length > 0) {
                                    const startRealtime = legBoardElement.getElementsByTagName("EstimatedTime")[0].childNodes[0].nodeValue;
                                    if (startRealtime) leg.departureDelay = moment(startRealtime).unix() - moment(leg.departure).unix();
                                }

                                if (legBoardElement.getElementsByTagName("PlannedBay").length > 0) {
                                    const startPlatform = legBoardElement.getElementsByTagName("PlannedBay")[0].getElementsByTagName("Text")[0].childNodes[0].nodeValue;
                                    if (startPlatform) leg.departurePlatform = startPlatform;
                                }

                                const destination: FPTFStop = {
                                    type: "stop",
                                    id: "",
                                    name: ""
                                }

                                const legAlightElement = legElement.getElementsByTagName("LegAlight")[0];

                                const endStationID = legAlightElement.getElementsByTagName("StopPointRef")[0].childNodes[0].nodeValue;
                                if (endStationID) destination.id = this.parseStationID(endStationID);

                                const endStationName = legAlightElement.getElementsByTagName("StopPointName")[0].getElementsByTagName("Text")[0].childNodes[0].nodeValue;
                                if (endStationName) destination.name = endStationName;

                                const endTime = legAlightElement.getElementsByTagName("TimetabledTime")[0].childNodes[0].nodeValue;
                                if (endTime) leg.arrival = this.parseResponseTime(endTime);

                                if (legAlightElement.getElementsByTagName("EstimatedTime").length > 0) {
                                    const endRealtime = legAlightElement.getElementsByTagName("EstimatedTime")[0].childNodes[0].nodeValue;
                                    if (endRealtime) leg.arrivalDelay = moment(endRealtime).unix() - moment(leg.arrival).unix();
                                }

                                if (legAlightElement.getElementsByTagName("PlannedBay").length > 0) {
                                    const endPlatform = legAlightElement.getElementsByTagName("PlannedBay")[0].getElementsByTagName("Text")[0].childNodes[0].nodeValue;
                                    if (endPlatform) leg.arrivalPlatform = endPlatform;
                                }

                                leg.line = {
                                    type: "line",
                                    id: "",
                                    line: ""
                                }

                                const pubLineNameTextElement = legElement.getElementsByTagName("PublishedLineName")[0].getElementsByTagName("Text")[0];
                                if (pubLineNameTextElement.childNodes.length > 0) {
                                    const lineName = pubLineNameTextElement.childNodes[0].nodeValue;
                                    if (lineName) {
                                        leg.line.id = lineName;
                                        leg.line.line = lineName;
                                    }
                                } else {
                                    const lineName = legElement.getElementsByTagName("Name")[0].getElementsByTagName("Text")[0].childNodes[0].nodeValue;
                                    if (lineName) {
                                        leg.line.id = lineName;
                                        leg.line.line = lineName;
                                    }
                                }

                                const direction = legElement.getElementsByTagName("DestinationText")[0].getElementsByTagName("Text")[0].childNodes[0].nodeValue;
                                if (direction) leg.direction = direction;

                                const mode = legElement.getElementsByTagName("PtMode")[0].childNodes[0].nodeValue;
                                if (mode === "bus") {
                                    leg.mode = FPTFMode.BUS;
                                } else if (mode === "tram") {
                                    leg.mode = FPTFMode.TRAIN;
                                    leg.subMode = FPTFSubmode.TRAM;
                                } else if (mode === "metro") {
                                    leg.mode = FPTFMode.TRAIN;
                                    leg.subMode = FPTFSubmode.METRO;
                                } else if (mode === "rail") {
                                    leg.mode = FPTFMode.TRAIN;
                                    leg.subMode = FPTFSubmode.RAIL;
                                }

                                leg.origin = origin;
                                leg.destination = destination;

                            } else if (legElement.getElementsByTagName("ContinuousLeg").length > 0 || legElement.getElementsByTagName("InterchangeLeg").length > 0) {

                                const origin: FPTFLocation = {
                                    type: "location",
                                    name: ""
                                }

                                const legStartElement = legElement.getElementsByTagName("LegStart")[0];

                                const startLocationName = legStartElement.getElementsByTagName("LocationName")[0].getElementsByTagName("Text")[0].childNodes[0].nodeValue;
                                if (startLocationName) origin.name = startLocationName;

                                if (legStartElement.getElementsByTagName("GeoPosition").length > 0) {
                                    const latitude = legStartElement.getElementsByTagName("Latitude")[0].childNodes[0].nodeValue;
                                    if (latitude) origin.latitude = parseFloat(latitude);

                                    const longitude = legStartElement.getElementsByTagName("Longitude")[0].childNodes[0].nodeValue;
                                    if (longitude) origin.longitude = parseFloat(longitude);
                                }

                                const destination: FPTFLocation = {
                                    type: "location",
                                    name: ""
                                }

                                const legEndElement = legElement.getElementsByTagName("LegEnd")[0];

                                const endLocationName = legEndElement.getElementsByTagName("LocationName")[0].getElementsByTagName("Text")[0].childNodes[0].nodeValue;
                                if (endLocationName) destination.name = endLocationName;

                                if (legEndElement.getElementsByTagName("GeoPosition").length > 0) {
                                    const latitude = legEndElement.getElementsByTagName("Latitude")[0].childNodes[0].nodeValue;
                                    if (latitude) destination.latitude = parseFloat(latitude);

                                    const longitude = legEndElement.getElementsByTagName("Longitude")[0].childNodes[0].nodeValue;
                                    if (longitude) destination.longitude = parseFloat(longitude);
                                }

                                const startTime = legElement.getElementsByTagName("TimeWindowStart")[0].childNodes[0].nodeValue;
                                if (startTime) leg.departure = this.parseResponseTime(startTime);

                                const endTime = legElement.getElementsByTagName("TimeWindowEnd")[0].childNodes[0].nodeValue;
                                if (endTime) leg.arrival = this.parseResponseTime(endTime);

                                leg.mode = FPTFMode.WALKING;

                                leg.origin = origin;
                                leg.destination = destination;

                            }

                            trip.legs.push(leg);

                        }

                        trips.push(trip);

                    }

                    const result: JourneysResult = {
                        success: true,
                        journeys: trips
                    }

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

    parseStationID(id: string) {
        if (!id.includes(":")) return id;
        const t = id.split(":");
        return t[0] + ":" + t[1] + ":" + t[2];
    }

    parseRequestTime(time: string) {
        return "<DepArrTime>" + moment(time).tz("Europe/Berlin").format("YYYY-MM-DDTHH:mm:ss") + "</DepArrTime>";
    }

    parseResponseTime(time: string) {
        return moment(time).tz("Europe/Berlin").format();
    }
}
