import {inspect} from "util";
import {getClient as getTriasClient} from ".";

const sbbProfile = {
	url: 'https://api.opentransportdata.swiss/trias2020',
	requestorRef: 'derhuerst/trias-client',
	headers: {
		authorization: '57c5dbbbf1fe4d000100001842c323fa9ff44fbba0b9b925f0c052d1', // test key
	},
}
const steinSäckingen = '8500320'
const laufenburg = '8500322'

const client = getTriasClient(sbbProfile)

;(async () => {
const {journeys} = await client.getJourneys({
		origin: steinSäckingen,
		destination: laufenburg,
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
