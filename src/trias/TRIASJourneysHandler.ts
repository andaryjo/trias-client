import * as moment from "moment-timezone";
import {get} from "lodash";

import {
    requestAndParse,
    selectAll, selectOne, getText, DOMElement,
} from '../request-and-parse';
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

    async getJourneys(options: JourneyRequestOptions): Promise<JourneysResult> {
        const maxResults = options.maxResults ? options.maxResults : 5;

        let arrTime; let depTime;
        if (options.arrivalTime) arrTime = this.parseRequestTime(options.arrivalTime);
        else if (options.departureTime) depTime = this.parseRequestTime(options.departureTime);

        const payload = TRIAS_TR.replace("$ORIGIN", options.origin)
            .replace("$DESTINATION", options.destination)
            .replace("$DEPTIME", depTime ? depTime : "")
            .replace("$ARRTIME", arrTime ? arrTime : "")
            .replace("$MAXRESULTS", maxResults.toString())
            .replace("$INCLUDE_FARES", options.includeFares ? 'true' : 'false')
            .replace("$TOKEN", this.requestorRef);

        const doc = await requestAndParse(this.url, this.requestorRef, this.headers, payload);

        const trips: Journey[] = [];

        for (const tripEl of selectAll('TripResult', doc)) {
            const trip: Journey = {
                type: "journey",
                id: "",
                legs: [],
                tickets: [],
            }

            const tripID = getText(selectOne('TripId', tripEl));
            if (tripID) trip.id = tripID;

            for (const legEl of selectAll('TripLeg', tripEl)) {
                const leg: FPTFLeg = {
                    mode: FPTFMode.UNKNOWN,
                    direction: "",
                    origin: "",
                    destination: "",
                    departure: "",
                    arrival: ""
                }

                if (selectOne('TimedLeg', legEl)) {
                    const origin: FPTFStop = {
                        type: "stop",
                        id: "",
                        name: ""
                    }

                    const legBoardEl = selectOne('LegBoard', legEl);

                    const startStationID = getText(selectOne('StopPointRef', legBoardEl));
                    if (startStationID) origin.id = this.parseStationID(startStationID);

                    const startStationName = getText(selectOne('StopPointName Text', legBoardEl));
                    if (startStationName) origin.name = startStationName;

                    const startTime = getText(selectOne('TimetabledTime', legBoardEl));
                    if (startTime) leg.departure = this.parseResponseTime(startTime);

                    const startRealtime = getText(selectOne('EstimatedTime', legBoardEl));
                    if (startRealtime) leg.departureDelay = moment(startRealtime).unix() - moment(leg.departure).unix();

                    const startPlatform = getText(selectOne('PlannedBay Text', legBoardEl));
                    if (startPlatform) leg.departurePlatform = startPlatform;

                    const destination: FPTFStop = {
                        type: "stop",
                        id: "",
                        name: ""
                    }

                    const legAlightEl = selectOne('LegAlight', legEl);

                    const endStationID = getText(selectOne('StopPointRef', legAlightEl));
                    if (endStationID) destination.id = this.parseStationID(endStationID);

                    const endStationName = getText(selectOne('StopPointName Text', legAlightEl));
                    if (endStationName) destination.name = endStationName;

                    const endTime = getText(selectOne('TimetabledTime', legAlightEl));
                    if (endTime) leg.arrival = this.parseResponseTime(endTime);

                    const endRealtime = getText(selectOne('EstimatedTime', legAlightEl));
                    if (endRealtime) leg.arrivalDelay = moment(endRealtime).unix() - moment(leg.arrival).unix();

                    const endPlatform = getText(selectOne('PlannedBay Text', legAlightEl));
                    if (endPlatform) leg.arrivalPlatform = endPlatform;

                    leg.line = {
                        type: "line",
                        id: "",
                        line: ""
                    }

                    const lineName = (
                        getText(selectOne('PublishedLineName Text', legEl)) ||
                        getText(selectOne('Name Text', legEl))
                    );
                    if (lineName && leg.line) {
                        leg.line.id = lineName;
                        leg.line.line = lineName;
                    }

                    const direction = getText(selectOne('DestinationText Text', legEl));
                    if (direction) leg.direction = direction;

                    const mode = getText(selectOne('PtMode', legEl));
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

                } else if (selectOne('ContinuousLeg', legEl) || selectOne('InterchangeLeg', legEl)) {

                    const origin: FPTFLocation = {
                        type: "location",
                        name: ""
                    }

                    const legStartEl = selectOne('LegStart', legEl);

                    const startLocationName = getText(selectOne('LocationName Text', legStartEl));
                    if (startLocationName) origin.name = startLocationName;

                    const startGeoPos = selectOne('GeoPosition', legStartEl);
                    if (startGeoPos) {
                        const latitude = getText(selectOne('Latitude', startGeoPos));
                        if (latitude) origin.latitude = parseFloat(latitude);

                        const longitude = getText(selectOne('Longitude', startGeoPos));
                        if (longitude) origin.longitude = parseFloat(longitude);
                    }

                    const destination: FPTFLocation = {
                        type: "location",
                        name: ""
                    }

                    const legEndEl = selectOne('LegEnd', legEl);

                    const endLocationName = getText(selectOne('LocationName Text', legEl));
                    if (endLocationName) destination.name = endLocationName;

                    const endGeoPos = selectOne('GeoPosition', legEndEl);
                    if (endGeoPos) {
                        const latitude = getText(selectOne('Latitude', endGeoPos));
                        if (latitude) destination.latitude = parseFloat(latitude);

                        const longitude = getText(selectOne('Longitude', endGeoPos));
                        if (longitude) destination.longitude = parseFloat(longitude);
                    }

                    const startTime = getText(selectOne('TimeWindowStart', legEl));
                    if (startTime) leg.departure = this.parseResponseTime(startTime);

                    const endTime = getText(selectOne('TimeWindowEnd', legEl));
                    if (endTime) leg.arrival = this.parseResponseTime(endTime);

                    leg.mode = FPTFMode.WALKING;

                    leg.origin = origin;
                    leg.destination = destination;

                }

                trip.legs.push(leg);

            }

            if (options.includeFares) {
                // todo: there might be multiple
                const faresEl = selectOne('TripFares', tripEl);
                for (const ticketEl of selectAll('Ticket', faresEl)) {
                    const ticket = this.parseResponseTicket(ticketEl)
                    if (ticket) trip.tickets.push(ticket);
                }
            }

            trips.push(trip);

        }

        return {
            success: true,
            journeys: trips
        };
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

    parseResponseTicket(ticketEl: DOMElement): Ticket | null {
        const id = getText(selectOne('TicketId', ticketEl));
        const name = getText(selectOne('TicketName', ticketEl));
        const faresAuthorityRef = getText(selectOne('FaresAuthorityRef', ticketEl));
        const faresAuthorityName = getText(selectOne('FaresAuthorityText', ticketEl));
        if (!id || !name || !faresAuthorityRef || !faresAuthorityName) return null;
        const price = getText(selectOne('Price', ticketEl));
        return {
            id,
            name,
            faresAuthorityRef,
            faresAuthorityName,
            price: price ? parseFloat(price) : null,
            currency: getText(selectOne('Currency', ticketEl)),
            tariffLevel: getText(selectOne('TariffLevel', ticketEl)),
            travelClass: getText(selectOne('TravelClass', ticketEl)),
            validFor: getText(selectOne('ValidFor', ticketEl)),
            validityDuration: getText(selectOne('ValidityDuration', ticketEl)),
        }
    }
}
