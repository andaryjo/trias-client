import {inspect} from "util";
import {getClient as getTriasClient} from ".";

const sbbProfile = {
	url: 'https://api.opentransportdata.swiss/trias2020',
	requestorRef: 'derhuerst/trias-client',
	headers: {
		authorization: '57c5dbbbf1fe4d000100001842c323fa9ff44fbba0b9b925f0c052d1', // test key
	},
}
const zürich = '8503000'
const luzern = '8505000'
const aarau = '8502113'

const client = getTriasClient(sbbProfile)

;(async () => {
	const {journeys} = await client.getJourneys({
		origin: zürich,
		destination: luzern,
		via: [aarau],
		departureTime: '2021-05-20T14:00+02:00',
		maxResults: 2,
		includeFares: true,
	})
	console.log(inspect(journeys, {depth: null, colors: true}))
})()
.catch((err) => {
	console.error(err)
	process.exit(1)
})
