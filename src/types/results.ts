interface Result {
    success: boolean;
}

interface DeparturesResult extends Result {
    departures?: FPTFStopover[];
    situations?: Situation[];
}

interface JourneysResult extends Result {
    journeys?: FPTFJourney[];
    situations?: Situation[];
}

interface StopsResult extends Result {
    stops?: FPTFStop[];
}
