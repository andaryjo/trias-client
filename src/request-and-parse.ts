import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {DOMParser} from "xmldom";

export async function request(
    url: string,
    requestorRef: string,
    headers: { [key: string]: string },
    reqBody: string,
): Promise<AxiosResponse<string>> {
    const req: AxiosRequestConfig = {
        url,
        method: 'POST',
        headers: {
            // There are two MIME assignments for XML data. These are:
            // - application/xml (RFC 7303, previously RFC 3023)
            // - text/xml (RFC 7303, previously RFC 3023)
            // https://en.wikipedia.org/wiki/XML_and_MIME
            'content-type': 'application/xml',
            'accept': 'application/xml',
            ...headers,
        },
        data: reqBody,
    };

    const res = await axios(req);
    return res;
}

export async function requestAndParse(
    url: string,
    requestorRef: string,
    headers: { [key: string]: string },
    reqBody: string,
): Promise<any> { // todo: properly specify type as XML DOM node
    const res = await request(url, requestorRef, headers, reqBody);

    // Some providers include XML tags like "<trias:Result>"
    // This function removes them from the body before parsing
    const sanitizedBody = res.data.replace(/trias:/g, "");
    const doc = new DOMParser().parseFromString(sanitizedBody);

    return doc;
}