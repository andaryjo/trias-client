module.exports = `
<?xml version="1.0" encoding="UTF-8" ?>
<Trias version="1.2" xmlns="http://www.vdv.de/trias" xmlns:siri="http://www.siri.org.uk/siri" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://raw.githubusercontent.com/VDVde/TRIAS/v1.2/Trias.xsd">
    <ServiceRequest>
        <siri:RequestorRef>$TOKEN</siri:RequestorRef>
        <RequestPayload>
            <TripRequest>
                <Origin>
                    <LocationRef>$ORIGIN</LocationRef>
                    $DEPTIME
                </Origin>
                <Destination>
                    <LocationRef>$DESTINATION</LocationRef>
                    $ARRTIME
                </Destination>
                <Params>
                    <IncludeTurnDescription>false</IncludeTurnDescription>
                    <IncludeTrackSections>true</IncludeTrackSections>
                    <IncludeLegProjection>false</IncludeLegProjection>
                    <IncludeIntermediateStops>false</IncludeIntermediateStops>
                    <IncludeFares>false</IncludeFares>
                    <NumberOfResults>$MAXRESULTS</NumberOfResults>
                </Params>
            </TripRequest>
        </RequestPayload>
    </ServiceRequest>
</Trias>
`;