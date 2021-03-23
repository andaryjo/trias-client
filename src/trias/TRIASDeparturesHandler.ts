import * as moment from "moment-timezone";
import * as request from "request";
import * as xmldom from "xmldom";

import { TRIAS_SER } from "../xml/TRIAS_SER";

export class TRIASDeparturesHandler {
    url;
    requestorRef;
    headers;

    constructor(options: ClientOptions) {
        this.url = options.url;
        this.requestorRef = options.requestorRef;
        this.headers = options.headers;
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
                                mode: FPTFMode.UNKNOWN,
                            },
                            direction: "",
                            departure: "",
                        };

                        const departureElement = departuresList.item(i);

                        let line;
                        const pubLineNameTextElement = departureElement?.getElementsByTagName("PublishedLineName").item(0)?.getElementsByTagName("Text").item(0);
                        if (pubLineNameTextElement?.childNodes?.length) line = pubLineNameTextElement.childNodes[0].nodeValue;
                        else line = departureElement?.getElementsByTagName("Name")?.item(0)?.getElementsByTagName("Text")?.item(0)?.childNodes[0].nodeValue;
                        if (line) {
                            departure.line.id = line;
                            departure.line.line = line;
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
                            departure.line.mode = FPTFMode.BUS;
                        } else if (type === "tram") {
                            departure.line.mode = FPTFMode.TRAIN;
                            departure.line.subMode = FPTFSubmode.TRAM;
                        } else if (type === "metro") {
                            departure.line.mode = FPTFMode.TRAIN;
                            departure.line.subMode = FPTFSubmode.METRO;
                        } else if (type === "rail") {
                            departure.line.mode = FPTFMode.TRAIN;
                            departure.line.subMode = FPTFSubmode.RAIL;
                        }
                        
                        departures.push(departure);
                    }

                    const result: DeparturesResult = {
                        success: true,
                        departures,
                    };

                    resolve(result);

                } catch (error) {
                    reject("The client encountered an error during parsing: " + error);
                    return;
                }

            });
        });
    }

    parseResponseTime(time: string) {
        return moment(time).tz("Europe/Berlin").format();
    }

    // Some providers include XML tags like "<trias:Result>"
    // This function removes them from the body before parsing
    sanitizeBody(body: string) {
        if (body.includes("trias:")) body.replace(/trias:/g, "");
        return body;
    }
}
