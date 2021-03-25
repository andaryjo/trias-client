interface Result {
    success: boolean;
}

interface DeparturesResult extends Result {
    departures?: FPTFStopover[];
    ticker?: string[];
}

interface StopsResult extends Result {
    stops?: FPTFStop[];
}
