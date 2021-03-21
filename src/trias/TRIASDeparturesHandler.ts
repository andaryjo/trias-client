const PAYLOAD_SER = require("../xml/TRIAS_SER");

class TRIASDeparturesHandler {
    url; requestorRef;

    moment = require('moment-timezone');
    request = require("request");
    xmldom = require('xmldom');

    constructor(url: string, requestorRef: string) {
        this.url = url;
        this.requestorRef = requestorRef;
    }

    getDepartures(options: DeparturesRequestOptions) {
        return new Promise((resolve, reject) => {

            var maxResults = options.maxResults ? options.maxResults : 20;

            var time;
            if (options.time) time = this.moment(options.time).tz("Europe/Berlin").format("YYYY-MM-DDTHH:mm:ss");
            else time = this.moment().tz("Europe/Berlin").format("YYYY-MM-DDTHH:mm:ss");

            var payload = PAYLOAD_SER.replace("$STATIONID", options.id).replace("$TIME", time).replace("$MAXRESULTS", maxResults).replace("$TOKEN", this.requestorRef);
            var headers = { 'Content-Type': 'application/xml' };

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

                var ticker = [];
                var departures: Array<FPTFStopover> = [];
    
                try {

                    var doc = new this.xmldom.DOMParser().parseFromString(body);
                    var situationsList = doc.getElementsByTagName("PtSituation");
                    for (var i = 0; i < situationsList.length; i++) {
    
                        var situationElement = situationsList.item(i);
                        var summary = situationElement.getElementsByTagName("Summary").item(0).childNodes[0].nodeValue;
                        var startTime = situationElement.getElementsByTagName("StartTime").item(0).childNodes[0].nodeValue;
                        var endTime = situationElement.getElementsByTagName("EndTime").item(0).childNodes[0].nodeValue;
                        var now = this.moment().tz("Europe/Berlin").unix();
                        if (now > startTime && now < endTime) {
                           if (summary) ticker.push(summary);
                        }
                    }
    
                    var departuresList = doc.getElementsByTagName("StopEvent");
                    for (var i = 0; i < departuresList.length; i++) {
    
                        var departureElement = departuresList.item(i);
    
                        var pubLineNameTextElement = departureElement.getElementsByTagName("PublishedLineName").item(0).getElementsByTagName("Text").item(0);
                        if (pubLineNameTextElement.childNodes.length > 0) var line = pubLineNameTextElement.childNodes[0].nodeValue;
                        else var line = departureElement.getElementsByTagName("Name").item(0).getElementsByTagName("Text").item(0).childNodes[0].nodeValue;
    
                        var direction = departureElement.getElementsByTagName("DestinationText").item(0).getElementsByTagName("Text").item(0).childNodes[0].nodeValue;
                        var time = this.parseResponseTime(departureElement.getElementsByTagName("TimetabledTime").item(0).childNodes[0].nodeValue);
    
                        var estimatedTimeList = departureElement.getElementsByTagName("EstimatedTime");
                        if (estimatedTimeList.length > 0) var realtime = estimatedTimeList.item(0).childNodes[0].nodeValue;

                        var delay = -1;
                        if (realtime) delay = (this.moment(realtime).unix() - this.moment(time).unix());
    
                        var plannedBayList = departureElement.getElementsByTagName("PlannedBay");
                        if (plannedBayList.length > 0) var platform = plannedBayList.item(0).getElementsByTagName("Text").item(0).childNodes[0].nodeValue;
    
                        var type = departureElement.getElementsByTagName("PtMode").item(0).childNodes[0].nodeValue;
                        var mode; var subMode;
                        if (type == "bus") mode = FPTFMode.BUS;
                        else if (type == "tram") {
                            mode = FPTFMode.TRAIN;
                            subMode = FPTFSubmode.TRAM;
                        }else if (type == "metro") {
                            mode = FPTFMode.TRAIN;
                            subMode = FPTFSubmode.METRO;
                        } else if (type == "rail") {
                            mode = FPTFMode.TRAIN;
                            subMode = FPTFSubmode.RAIL;
                        } else mode = FPTFMode.UNKNOWN;

                        var departure: FPTFStopover = {
                            type: "stopover",
                            stop: options.id,
                            line: {
                                type: "line",
                                id: line,
                                line: line,
                                mode: mode,
                            },
                            direction: direction,
                            departure: time,
                        }

                        if (delay >= 0) departure.departureDelay = delay;
                        if (platform) departure.departurePlatform = platform;
                        if (subMode) departure.line.subMode = subMode; 
    
                        departures.push(departure);
    
                    }

                    var result: DeparturesResult = {
                        success: true,
                        departures: departures
                    }

                    resolve(result);
    
                } catch (error) {
                    reject("The client encountered an error during parsing: " + error);
                    return;
                }
    
            });

        });
    
    }

    parseResponseTime(time: string) {
        return this.moment(time).tz("Europe/Berlin").format();
    }

    // Some providers include XML tags like "<trias:Result>"
    // This function removes them from the body before parsing
    sanitizeBody(body: string) {
        if (body.includes("trias:")) body.replace(/trias:/g, '');
        return body;
    }
}

module.exports = TRIASDeparturesHandler;
