# TRIAS Client

**A lean Node.js client for TRIAS APIs. 🚀**

This client aims to be an easy-to use and lightweight implementation for the Public Transport TRIAS specification. It achieves that by providing only a small subset of the capabilities of TRIAS and utilizing the [Friendly Public Transport Format](https://github.com/public-transport/friendly-public-transport-format).

The TRIAS Client currently only supports two basic functionalities:
- Searching for stops (either using a name or coordinates).
- Fetching departures for a stop.

## Usage

> Please note that you will need an API endpoint and an API key or requestor reference key issued to you by the data provider.

Install the package:

```
npm install <tbd>
```

Following script creates a TRIAS client, searches for a station and fetches the departures for the first result:

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

TRIAS stands for "**T**ravellor **R**ealtime **I**nformation and **A**dvisory **S**tandard", has been developed in scope of the research and standardisation project for public transport "IP-KOM-ÖV" and was then introduced in 2014 as a standardized specification by the VDV ([Verband Deutscher Verkehrsunternehmen](https://de.wikipedia.org/wiki/Verband_Deutscher_Verkehrsunternehmen)). TRIAS offers a wide-range list of functionalities, including station / location search, realtime departures, navigation, ticket price calculation, malfunction reportings, and so on. [Here](https://github.com/andaryjo/trias-client/blob/v1/PROVIDERS.md) is a list of all public transport providers that provide a TRIAS interface.

Currently, there aren't a lot of helpful resources on TRIAS. Most providers only publish a few implementation examples and refer to the documentation: [VDV 431-2 EKAP-Schnittstellenbeschreibung](https://www.vdv.de/ip-kom-oev.aspx)

## Why TRIAS?

Compared to [HAFAS](https://github.com/public-transport/hafas-client), TRIAS isn't that widely distributed. But it's a step in the right direction as it allows for some kind of standardization in the jungle of Public Transport APIs. Unfortunately, many of the data providers still build their own proprietary APIs.

You might wonder why this even matters if you can just continue to use the existing HAFAS interfaces. The biggest difference is that these HAFAS interfaces are not supposed to be used by the public and public transport providers might even prohibit to use them. So if you want to develop and publish a project that uses public transport data, you might want to have some kind of agreement with the data provider, that reduces operational and legal risk for both you and the provider.

And this is where TRIAS becomes relevant, as the APIs built on it are public (not open, as they still require authentication, but public). And while some providers are a bit more strict regarding the use and display of the data, in general all of the APIs have fair terms of use and come with realistic usage quotas.

TRIAS is XML-based (urgh) and comes with a quite high request payload, but it's easy to understand and well documented.

**Made with :two_hearts: in Heidelberg.**
