interface Result {
    success: boolean;
}

interface DeparturesResult extends Result {
    departures?: FPTFStopover[];
    ticker?: string[];
}

interface JourneysResult extends Result {
    journeys?: FPTFJourney[];
}

interface StopsResult extends Result {
    stops?: FPTFStop[];
}

