interface ClientOptions {
    url: string;
    requestorRef: string;
}

interface DeparturesRequestOptions {
    id: string;
    time?: string;
    maxResults?: number;
}

interface StopsRequestOptions {
    name?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    maxResults?: number;
}