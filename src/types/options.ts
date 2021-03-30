interface ClientOptions {
    url: string;
    requestorRef?: string;
    headers?: { [key: string]: string };
}

interface DeparturesRequestOptions {
    id: string;
    time?: string;
    maxResults?: number;
}

interface JourneyRequestOptions {
    origin: string;
    destination: string;
    departureTime?: string;
    arrivalTime?: string;
    maxResults?: number;
}

interface StopsRequestOptions {
    name?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    maxResults?: number;
}
