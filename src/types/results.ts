interface Result {
    success: boolean;
}

interface DeparturesResult extends Result {
    departures?: FPTFStopover[];
}

interface StopsResult extends Result {
    stops?: FPTFStop[];
}
