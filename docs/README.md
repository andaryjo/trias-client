# Trias Client Documentation

This Node.js module is written using TypeScript and therefore comes with easy to use type specifications you can have a look at in the [`types`](../src/types) directory.

Every function requires defined [options](../src/types/options.ts) and returns defined [results](../src/types/results.ts), which then include [Friendly Public Transport Format](https://github.com/public-transport/friendly-public-transport-format) elements. As of now, the FPTF does not fully support all TRIAS functionalities, so be aware that there are some [slight differences](../src/types/fptf.ts).

## trias.getClient(ClientOptions options)

This function returns a client that you can use to perform requests against a TRIAS API. It requires [`ClientOptions`](..src/types/options.ts#L1) and will return a [`TriasClient`](../src/index.ts#L9) instance.

| Paramater | Description | Type | Required | Default | Example |
|---|---|---|---|---|---|
| url | URL of the TRIAS API. | string | yes | none | `"https://provider.data/trias"` |
| requestorRef | Requestor ref for the TRIAS API. | string | no | none | `"user123"` |
| headers | Custom http headers for the requests to the TRIAS API. | Object | no | none | `{"x-test-header": "myvalue"}` |

## client.getStops(StopsRequestOptions options)

 This function returns a list of stops that fit the given search criteria. It requires [`StopsRequestOptions`](../src/types/options.ts#L23) and will return a Promise which resolves into a [`StopsResult`](..src/types/results.ts#L14).

| Paramater | Description | Type | Required | Default | Example |
|---|---|---|---|---|---|
| name | Name of the stop. Required when no coordinates are provided. | string | no | none | `"Bismarckplatz"` |
| latitude | Latitude for location search. Required when no name is provided. | number | no | none | `49.4098614` |
| longitude | Longitude for location search. Required when no name is provided. | number | no | none | `8.6931989` |
| radius | Radius for location search. | number | no | `500` | `1000` |
| maxResults | Maximum amount of results. | number | no | `10` | `15` |

## client.getDepartures(DeparturesRequestOptions options)

This function returns a list of departures and ticker information for a given stop. It requires [`DeparturesRequestOptions`](../src/types/options.ts#L7) and will return a Promise which resolves into a [`DeparturesResult`](../src/types/results.ts#L5).

| Paramater | Description | Type | Required | Default | Example |
|---|---|---|---|---|---|
| id | ID of the stop. | string | yes | none | `"de:08222:2417"` |
| time | Requested time for departures as ISO 8601. | string | no | now | `"2021-03-24T21:14:00+01:00` |
| maxResults | Maximum amount of results. | number | no | `25` | `15` |
| includeSituations | Whether you want to retrieve situations. | boolean | no |`false` | `false` |

## client.getJourneys(DeparturesRequestOptions options)

This function returns a list of journeys for given origin and destination stops. It requires [`JourneysRequestOptions`](../src/types/options.ts#L13) and will return a Promise which resolves into a [`JourneysResult`](../src/types/results.ts#L10).

| Paramater | Description | Type | Required | Default | Example |
|---|---|---|---|---|---|
| origin | ID of the origin stop. | string | yes | none | `"de:08222:2417"` |
| destination | ID of the destination stop. | string | yes | none | `"de:08221:1146"` |
| via | IDs of the in between stops. | array | no | `[]` | `["de:08221:1146"]` |
| arrivalTime | Desired time of arrival as ISO 8601. Overrides departure time. | string | no | none | `"2021-03-24T21:14:00+01:00` |
| departureTime | Desired time of departure as ISO 8601. Only considered if arrival time is not set. | string | no | now | `"2021-03-24T23:08:00+01:00` |
| maxResults | Maximum amount of results. | number | no | `5` | `15` |
| includeFares | Whether you want to retrieve fares. | boolean | no |`false` | `false` |
| includeSituations | Whether you want to retrieve situations. | boolean | no |`false` | `false` |
