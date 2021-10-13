import * as moment from "moment-timezone";

import { requestAndParse, selectAll, selectOne, getText } from "../RequestAndParse";
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

    async getDepartures(options: DeparturesRequestOptions): Promise<DeparturesResult> {
        const maxResults = options.maxResults ? options.maxResults : 20;

        let time;
        if (options.time) time = moment(options.time).tz("Europe/Berlin").format("YYYY-MM-DDTHH:mm:ss");
        else time = moment().tz("Europe/Berlin").format("YYYY-MM-DDTHH:mm:ss");

        const payload = TRIAS_SER.replace("$STATIONID", options.id).replace("$TIME", time).replace("$MAXRESULTS", maxResults.toString()).replace("$TOKEN", this.requestorRef);

        const doc = await requestAndParse(this.url, this.requestorRef, this.headers, payload);

        const situations: Situation[] = [];
        const departures: FPTFStopover[] = [];

        if (options.includeSituations) {
            for (const situationEl of selectAll("PtSituation", doc)) {
                const summary = getText(selectOne("Summary", situationEl));
                const detail = getText(selectOne("Detail", situationEl));
                const startTime = getText(selectOne("StartTime", situationEl));
                const endTime = getText(selectOne("EndTime", situationEl));
                const priority = getText(selectOne("Priority", situationEl));

                const situation: Situation = {
                    title: summary || "",
                    description: detail || "",
                    validFrom: startTime || "",
                    validTo: endTime || "",
                    priority: priority || "",
                };

                situations.push(situation);
            }
        }

        for (const departureEl of selectAll("StopEvent", doc)) {
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

            const lineName = getText(selectOne("PublishedLineName Text", departureEl)) || getText(selectOne("Name Text", departureEl));
            if (lineName && departure.line) {
                departure.line.id = lineName;
                departure.line.line = lineName;
            }

            const direction = getText(selectOne("DestinationText Text", departureEl));
            if (direction) departure.direction = direction;

            // todo: planned*
            const timetabledTime = getText(selectOne("TimetabledTime", departureEl));
            if (timetabledTime) departure.departure = this.parseResponseTime(timetabledTime);

            const estimatedTime = getText(selectOne("EstimatedTime", departureEl));
            if (estimatedTime) departure.departureDelay = moment(estimatedTime).unix() - moment(timetabledTime).unix();

            const plannedBay = getText(selectOne("PlannedBay Text", departureEl));
            if (plannedBay) departure.departurePlatform = plannedBay;

            const type = getText(selectOne("PtMode", departureEl));
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
        };
        if (options.includeSituations) result.situations = situations;

        return result;
    }

    parseResponseTime(time: string): string {
        return moment(time).tz("Europe/Berlin").format();
    }
}
