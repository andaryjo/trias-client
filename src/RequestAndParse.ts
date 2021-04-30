import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { Document, Node as DOMNode, Element as DOMElement, DomHandler as DOMHandler, DomHandlerOptions as DOMHandlerOptions } from "domhandler";
import { Options as CssSelectOptions, selectAll as _selectAll, selectOne as _selectOne, compile as _compile } from "css-select";
import { CompiledQuery } from "css-select/lib/types";
import { getText as _getText } from "domutils";
import { Parser, ParserOptions } from "htmlparser2";

export { Element as DOMElement } from "domhandler";

const DEBUG = /(^|,)trias-client(,|$)/.test(process.env.DEBUG || "");

export async function request(url: string, requestorRef: string, headers: { [key: string]: string }, reqBody: string): Promise<AxiosResponse<string>> {

    // It is important to keep the functionality to override the Content-Type header. Some APIs do not work with application/xml but only with text/xml
    // Also, using an accept header does not work for the same reason
    if (!headers["Content-Type"]) headers["Content-Type"] = "application/xml";

    const req: AxiosRequestConfig = {
        url,
        method: "POST",
        headers: headers,
        data: reqBody,
    };

    // tslint:disable-next-line:no-console
    if (DEBUG) console.error(reqBody);

    const res = await axios(req);

    // tslint:disable-next-line:no-console
    if (DEBUG) console.error(res.data);

    return res;
}

export function selectAll(query: string, elements: DOMNode | DOMNode[] | null, options: CssSelectOptions<DOMNode, DOMElement> = {}): DOMElement[] {
    if (elements === null) return [];
    return _selectAll(query, elements, {
        xmlMode: true,
        ...options,
    });
}
export function selectOne(query: string, elements: DOMNode | DOMNode[] | null, options: CssSelectOptions<DOMNode, DOMElement> = {}): DOMElement | null {
    if (elements === null) return null;
    return _selectOne(query, elements, {
        xmlMode: true,
        ...options,
    });
}
export function compile(selector: string, options: CssSelectOptions<DOMNode, DOMElement> = {}, context: DOMNode | DOMNode[] | undefined): CompiledQuery<DOMElement> {
    return _compile(
        selector,
        {
            xmlMode: true,
            ...options,
        },
        context,
    );
}

export function getText(node: DOMNode | DOMNode[] | null): string | null {
    return node ? _getText(node) : null;
}

// https://github.com/fb55/htmlparser2/blob/ee6879069b4d30ecb327ca1426747791f45d3920/src/index.ts#L18-L28
export function parseResponse(data: string): Document {
    const handler = new DOMHandler(null, {
        withStartIndices: false,
        withEndIndices: false,
    });
    const onOpenTag = handler.onopentag.bind(handler);
    // https://github.com/fb55/domhandler/blob/7aec3ae0f4ac59325f04d833a6e10f767a49d035/src/index.ts#L160-L165
    handler.onopentag = (name: string, attribs: { [key: string]: string }): void => {
        onOpenTag(name.replace(/^trias:/, ""), attribs);
    };

    const parser = new Parser(handler, {
        xmlMode: true,
        decodeEntities: true,
    });
    parser.end(data);
    return handler.root;
}

export async function requestAndParse(url: string, requestorRef: string, headers: { [key: string]: string }, reqBody: string): Promise<Document> {
    const res = await request(url, requestorRef, headers, reqBody);
    return parseResponse(res.data);
}
