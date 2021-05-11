interface ClientOptions {
    url: string;
    requestorRef?: string;
    headers?: { [key: string]: string };
}

interface DeparturesRequestOptions {
    id: string;
    time?: string;
    maxResults?: number;
    includeSituations?: boolean;
}

interface JourneyRequestOptions {
    origin: string;
    destination: string;
    via?: string[];
    departureTime?: string;
    arrivalTime?: string;
    maxResults?: number;
    includeFares?: boolean;
    includeSituations?: boolean;
}

interface StopsRequestOptions {
    name?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    maxResults?: number;
}
