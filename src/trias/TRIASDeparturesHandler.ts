import axios from 'axios';
import * as moment from "moment-timezone";
import * as xmldom from "xmldom";

import { TRIAS_SER } from "../xml/TRIAS_SER";

export class TRIASDeparturesHandler {
    url: string;
    requestorRef: string;
    headers: { [key: string]: string };

    constructor(url: string, requestorRef: string, headers: { [key: string]: string }) {
        this.url = url;
        this.requestorRef = requestorRef;
        this.headers = headers;
    }

    getDepartures(options: DeparturesRequestOptions) {
        return new Promise((resolve, reject) => {
            const maxResults = options.maxResults ? options.maxResults : 20;

            let time;
            if (options.time) time = moment(options.time).tz("Europe/Berlin").format("YYYY-MM-DDTHH:mm:ss");
            else time = moment().tz("Europe/Berlin").format("YYYY-MM-DDTHH:mm:ss");

            const payload = TRIAS_SER.replace("$STATIONID", options.id)
                .replace("$TIME", time)
                .replace("$MAXRESULTS", maxResults.toString())
                .replace("$TOKEN", this.requestorRef);

            if (!this.headers["Content-Type"]) this.headers["Content-Type"] = "application/xml";

            axios.post(this.url, payload, { headers: this.headers }).then((response) => {

                const body = this.sanitizeBody(response.data);

                const ticker = [];
                const departures: FPTFStopover[] = [];

                try {

                    const doc = new xmldom.DOMParser().parseFromString(body);
                    const situationsList = doc.getElementsByTagName("PtSituation");

                    for (let i = 0; i < situationsList.length; i++) {

                        const situationElement = situationsList.item(i);
                        const summary = situationElement?.getElementsByTagName("Summary").item(0)?.childNodes[0].nodeValue;
                        if (!summary) continue;
                        const startTime = situationElement?.getElementsByTagName("StartTime").item(0)?.childNodes[0].nodeValue;
                        const endTime = situationElement?.getElementsByTagName("EndTime").item(0)?.childNodes[0].nodeValue;

                        const now = moment().unix();
                        if (now > moment(startTime).unix() && now < moment(endTime).unix()) ticker.push(summary);
                    }

                    const departuresList = doc.getElementsByTagName("StopEvent");

                    for (let i = 0; i < departuresList.length; i++) {

                        const departure: FPTFStopover = {
                            type: "stopover",
                            stop: options.id,
                            line: {
                                type: "line",
                                id: "",
                                line: "",
                            },
                            mode: FPTFMode.UNKNOWN,
                            direction: "",
                            departure: "",
                        };

                        const departureElement = departuresList.item(i);

                        let lineName;
                        const pubLineNameTextElement = departureElement?.getElementsByTagName("PublishedLineName").item(0)?.getElementsByTagName("Text").item(0);
                        if (pubLineNameTextElement?.childNodes?.length) lineName = pubLineNameTextElement.childNodes[0].nodeValue;
                        else lineName = departureElement?.getElementsByTagName("Name")?.item(0)?.getElementsByTagName("Text")?.item(0)?.childNodes[0].nodeValue;
                        if (lineName && departure.line) {
                            departure.line.id = lineName;
                            departure.line.line = lineName;
                        }

                        const direction = departureElement?.getElementsByTagName("DestinationText")?.item(0)?.getElementsByTagName("Text")?.item(0)?.childNodes[0].nodeValue;
                        if (direction) departure.direction = direction;

                        const timetabledTime = departureElement?.getElementsByTagName("TimetabledTime")?.item(0)?.childNodes[0].nodeValue;
                        if (timetabledTime) departure.departure = this.parseResponseTime(timetabledTime);

                        const estimatedTime = departureElement?.getElementsByTagName("EstimatedTime")?.item(0)?.childNodes[0].nodeValue;
                        if (estimatedTime) departure.departureDelay = moment(estimatedTime).unix() - moment(timetabledTime).unix();

                        const plannedBay = departureElement?.getElementsByTagName("PlannedBay")?.item(0)?.getElementsByTagName("Text")?.item(0)?.childNodes[0].nodeValue;
                        if (plannedBay) departure.departurePlatform = plannedBay;

                        const type = departureElement?.getElementsByTagName("PtMode")?.item(0)?.childNodes[0].nodeValue;
                        if (type === "bus") {
                            departure.mode = FPTFMode.BUS;
                        } else if (type === "tram") {
                            departure.mode = FPTFMode.TRAIN;
                            departure.subMode = FPTFSubmode.TRAM;
                        } else if (type === "metro") {
                            departure.mode = FPTFMode.TRAIN;
                            departure.subMode = FPTFSubmode.METRO;
                        } else if (type === "rail") {
                            departure.mode = FPTFMode.TRAIN;
                            departure.subMode = FPTFSubmode.RAIL;
                        }

                        departures.push(departure);
                    }

                    const result: DeparturesResult = {
                        success: true,
                        departures,
                        ticker
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
