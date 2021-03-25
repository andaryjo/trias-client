# Trias Client Documentation

This Node.js module is written using TypeScript and therefore comes with easy to use type specifications you can have a look at in the [`types`](https://github.com/andaryjo/trias-client/blob/main/src/types) directory.

Every function requires defined [options](https://github.com/andaryjo/trias-client/blob/main/src/types/options.ts) and returns defined [results](https://github.com/andaryjo/trias-client/blob/main/src/types/results.ts), which then include [Friendly Public Transport Format](https://github.com/andaryjo/trias-client/blob/main/src/types/fptf.ts) elements.

## Import

Import the module using:

```javascript
const trias = require("trias-client");
```

## trias.getClient(ClientOptions options)

This function returns a client that you can use to perform requests against a TRIAS API. It requires `ClientOptions` and will return a `TriasClient` instance.

| Paramater | Description | Type | Required | Default | Example |
|---|---|---|---|---|---|
| url | URL of the TRIAS API. | string | yes | none | `"https://provider.data/trias"` |
| requestorRef | Requestor ref for the TRIAS API. | string | no | none | `"user123"` |
| headers | Custom http headers for the requests to the TRIAS API. | Object | no | none | `{"x-test-header": "myvalue"}` |

## client.getStops(StopsRequestOptions options)

 This function returns a list of stops that fit the given search criteria. It requires `StopsRequestOptions` and will return a Promise which resolves into a `StopsResult`.

| Paramater | Description | Type | Required | Default | Example |
|---|---|---|---|---|---|
| name | Name of the stop. Required when no coordinates are provided. | string | no | none | `"Bismarckplatz"` |
| latitude | Latitude for location search. Required when no name is provided. | number | no | none | `49.4098614` |
| longitude | Longitude for location search. Required when no name is provided. | number | no | none | `8.6931989` |
| radius | Radius for location search. | number | no | `500` | `1000` |
| maxResults | Maximum amount of results. | number | no | `10` | `15` |

## client.getDepartures(DeparturesRequestOptions options)

This function returns a list of departures and ticker information for a given stop. It requires `DeparturesRequestOptions` and will return a Promise which resolves into a `DeparturesResult`.

| Paramater | Description | Type | Required | Default | Example |
|---|---|---|---|---|---|
| id | ID of the stop. | string | yes | none | `"1146"` |
| time | Requested time for departures in ISO 8601 format. | string | no | now | `"2021-03-24T21:14:00+01:00` |
| maxResults | Maximum amount of results. | number | no | `25` | `15` |