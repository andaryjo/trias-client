import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {Document, Node as DOMNode, Element as DOMElement} from 'domhandler';
import {
    Options as CssSelectOptions,
    selectAll as _selectAll,
    selectOne as _selectOne,
    compile as _compile,
} from 'css-select';
import {CompiledQuery} from 'css-select/lib/types';
import {
    getText as _getText,
} from 'domutils';
import {parseDocument} from 'htmlparser2';

export {Element as DOMElement} from 'domhandler';

const DEBUG = /(^|,)trias-client(,|$)/.test(process.env.DEBUG || '')

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
    // tslint:disable-next-line:no-console
    if (DEBUG) console.error(reqBody);

    const res = await axios(req);
    // tslint:disable-next-line:no-console
    if (DEBUG) console.error(res.data);
    return res;
}

export function selectAll(
    query: string,
    elements: DOMNode | DOMNode[] | null,
    options: CssSelectOptions<DOMNode, DOMElement> = {},
): DOMElement[] {
    if (elements === null) return [];
    return _selectAll(query, elements, {
        xmlMode: true,
        ...options,
    });
}
export function selectOne(
    query: string,
    elements: DOMNode | DOMNode[] | null,
    options: CssSelectOptions<DOMNode, DOMElement> = {},
): DOMElement | null {
    if (elements === null) return null;
    return _selectOne(query, elements, {
        xmlMode: true,
        ...options,
    });
}
export function compile(
    selector: string,
    options: CssSelectOptions<DOMNode, DOMElement> = {},
    context: DOMNode | DOMNode[] | undefined,
): CompiledQuery<DOMElement> {
    return _compile(selector, {
        xmlMode: true,
        ...options,
    }, context);
}

export function getText(
    node: DOMNode | DOMNode[] | null,
): string | null {
    return node ? _getText(node) : null;
}

export async function requestAndParse(
    url: string,
    requestorRef: string,
    headers: { [key: string]: string },
    reqBody: string,
): Promise<Document> {
    const res = await request(url, requestorRef, headers, reqBody);

    // Some providers include XML tags like "<trias:Result>"
    // This function removes them from the body before parsing
    const sanitizedBody = res.data.replace(/trias:/g, "");

    const doc = parseDocument(sanitizedBody, {
        xmlMode: true,
        decodeEntities: true,
        withStartIndices: false,
        withEndIndices: false,
    });

    return doc;
}