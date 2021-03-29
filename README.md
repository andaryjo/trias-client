# TRIAS Client

**A lean Node.js client for TRIAS APIs. 🚀**

This client aims to be an easy to use and lightweight implementation for the public transport TRIAS specification. It achieves that by providing only a small subset of the capabilities of TRIAS and utilizing the [Friendly Public Transport Format](https://github.com/public-transport/friendly-public-transport-format).

`trias-client` currently implements TRIAS v1.2 and only supports following basic functionalities:
- Searching for stops (either using a name or coordinates).
- Fetching departures for a stop.
- Reading current ticker news for a stop.

## Usage

> Please note that you will need an API endpoint and an API key or requestor reference key issued by a data provider. Check the [providers list](https://github.com/andaryjo/trias-client/blob/main/docs/PROVIDERS.md) for open APIs.

Install the package:

```
npm install trias-client
```

Following script creates client instance, searches for a station and fetches the departures for the first result. Please refer to the [documentation](https://github.com/andaryjo/trias-client/blob/main/docs/README.md) for more information.

```javascript
const trias = require("trias-client");

var client = trias.getClient({
    url: "place the url of the TRIAS API here",
    requestorRef: "place your requestor ref here"
});

var stopsResult = await client.getStops({
    name: "bismarckplatz"
});

var departuresResult = await client.getDepartures({
    id: stopsResult.stops[0].id
});
```

## What is TRIAS?

TRIAS stands for "**T**ravellor **R**ealtime **I**nformation and **A**dvisory **S**tandard", has been developed in scope of the research and standardisation project for public transport "IP-KOM-ÖV" and was then introduced in 2014 as a standardized specification by the VDV ([Verband Deutscher Verkehrsunternehmen](https://de.wikipedia.org/wiki/Verband_Deutscher_Verkehrsunternehmen)). TRIAS offers a wide-range list of functionalities, including station / location search, realtime departures, navigation, ticket price calculation, malfunction reportings, and so on. [Here](https://github.com/andaryjo/trias-client/blob/main/docs/PROVIDERS.md) is a list of all public transport providers that provide a TRIAS API.

## Why TRIAS?

Compared to [HAFAS](https://github.com/public-transport/hafas-client), TRIAS isn't that widely distributed. But it's a step in the right direction as it allows for some kind of standardization in the jungle of Public Transport APIs. Unfortunately, many of the data providers still build their own proprietary APIs.

You might wonder why this even matters if you can just continue to use the existing HAFAS interfaces. The biggest difference is that these HAFAS interfaces are not supposed to be used by the public and public transport providers might even prohibit to use them (you can read more about that [here](https://github.com/public-transport/transport.rest/issues/4)). So if you want to develop and publish a project that uses public transport data, you might want to have some kind of agreement with the data provider, that reduces operational and legal risk for both you and the provider.

And this is where TRIAS becomes relevant, as the APIs built on it are public (not open, as they still require authentication, but public). And while some providers are a bit more strict regarding the use and display of the data, in general all of the APIs have fair terms of use and come with realistic usage quotas.

## Related resources

`trias-client` was originally developed in scope of Abfahrt, a public transport companion for both [Web](https://abfahrt.io) and [Android](https://play.google.com/store/apps/details?id=de.andary.abfahrt) that integrates multiple ÖPNV providers in just one app. You can take a look over there to see this client in action.

Dou you want to develop your own TRIAS client? Here are some resources:
- [VDV 431-2 EKAP-Schnittstellenbeschreibung (german)](https://www.vdv.de/ip-kom-oev.aspx)
- [VDV TRIAS XML specification](https://github.com/VDVde/TRIAS)
- [TRIAS implementation example in PHP](https://www.vrn.de/opendata/node/118)
- [TRIAS request examples (german)](https://www.verbundlinie.at/fahrplan/rund-um-den-fahrplan/link-zum-fahrplan)

**Made with :two_hearts: in Heidelberg.**
