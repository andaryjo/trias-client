interface Result {
    success: boolean;
}

interface StopsResult extends Result {
    stops?: Array<FPTFStop>;
}