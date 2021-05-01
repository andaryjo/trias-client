/**
 * Using the Friendly Public Transport Format (FPTF) v1.2.1 for all responses
 * However, some optional attributes were removed as they are not supported by TRIAS
 * See https://github.com/public-transport/friendly-public-transport-format/tree/1.2.1
 *
 * For reference, this data model mostly aligns with the one of Abfahrt Core, which has been used in TRIAS use cases for a long time
 * See https://gitlab.com/andary/abfahrt-core/-/blob/2.0/swagger.yaml
 */

interface FPTFStop {
    type: string;
    id: string;
    name: string;
    location?: FPTFLocation;
}

interface FPTFLocation {
    type: string;
    name?: string;
    address?: string;
    longitude?: number;
    latitude?: number;
    altitude?: number;
}

interface FPTFLine {
    type: string;
    id: string;
    line: string;
}

interface FPTFStopover {
    type: string;
    stop: string;
    line?: FPTFLine; // Not included in FPTF
    mode: FPTFMode;
    subMode?: FPTFSubmode;
    direction?: string; // Not included in FPTF
    arrival?: string;
    arrivalDelay?: number;
    arrivalPlatform?: string;
    departure?: string;
    departureDelay?: number;
    departurePlatform?: string;
}

interface FPTFJourney {
    type: string;
    id: string;
    legs: FPTFLeg[];
    tickets?: Ticket[]; // Not included in FPTF
}

interface FPTFLeg {
    line?: FPTFLine; // Not included in FPTF
    mode: FPTFMode;
    subMode?: FPTFSubmode;
    direction: string; // Not included in FPTF
    origin: string | FPTFStop | FPTFLocation;
    destination: string | FPTFStop | FPTFLocation;
    departure: string;
    departureDelay?: number;
    departurePlatform?: string;
    arrival: string;
    arrivalDelay?: number;
    arrivalPlatform?: string;
    stopovers?: FPTFStopover[];
}

const enum FPTFMode {
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
const enum FPTFSubmode {
    METRO = "metro",
    RAIL = "rail",
    TRAM = "tram",
}

// Not included in FPTF
interface Ticket {
    id: string;
    name: string;
    faresAuthorityRef: string;
    faresAuthorityName: string;
    price: number | null;
    // todo: <NetPrice>
    currency: string | null;
    // todo: <VatRate>
    tariffLevel: string | null;
    // todo: <TariffLevelLabel>
    travelClass: string | null; // todo: make an enum
    // todo: <RequiredCard>
    validFor: string | null; // todo: make an enum
    validityDuration: string | null;
    // todo: <ValidityDurationText>
    // todo: <ValidityFareZones>
    // todo: <ValidityAreaText>
    // todo: <InfoUrl>
    // todo: <SaleUrl>
    // todo: <BookingInfo>
}
