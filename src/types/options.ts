interface ClientOptions {
    url: string;
    requestorRef: string;
}

interface StopsRequestOptions {
    name?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    maxResults?: number;
}