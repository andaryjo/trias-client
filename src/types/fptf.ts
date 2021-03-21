/**
 * Using the Friendly Public Transport Format (FPTF) v1.2.1 for all responses
 * However, some optional attributes were removed as they are not supported by TRIAS
 * See https://github.com/public-transport/friendly-public-transport-format/tree/1.2.1
 * 
 * For reference, this data model mostly aligns with the one of Abfahrt Core, which has been used in TRIAS use cases for a long time
 * See https://gitlab.com/andary/abfahrt-core/-/blob/2.0/swagger.yaml
**/

interface stop {
    type: string;
    id: string;
    name: string;
    location?: location,
}

interface location {
    type: string;
    id: number;
}

interface line {
    type: string;
    id: string;
    line: string;
    mode: string;
}

interface stopover {
    type: string;
    stop: string;
    arrival: string;
    arrivalDelay?: number;
    arrivalPlatform?: string;
    departure: string;
    departureDelay?: number;
    departurePlatform?: string;
}

interface journey {
    type: string;
    id: string;
    legs: Array<leg>;
}

interface leg {
    origin: string;
    destination: string;
    departure: string;
    departureDelay?: number;
    arrival: string;
    arrivalDelay?: number;
    arrivalPlatform: string;
    stopovers?: Array<stopover>;
    mode: mode;
    subMode: submode;
}

enum mode {
    AIRCRAFT = "aircraft",
    BICYCLE = "bicycle",
    BUS = "bus",
    CAR = "car",
    GONDOLA = "gondola",
    TAXI = "taxi",
    TRAIN = "train",
    UNKNOWN = "unknown", // Not included in FPTF
    WALKING = "walking",
    WATERCRAFT = "watercraft",
}

// To be defined in FPTF
enum submode { 
    METRO = "metro",
    RAIL = "rail",
    TRAM = "tram",
}