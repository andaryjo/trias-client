interface Result {
    success: boolean;
}

interface DeparturesResult extends Result {
    departures?: Array<FPTFStopover>;
}

interface StopsResult extends Result {
    stops?: Array<FPTFStop>;
}
