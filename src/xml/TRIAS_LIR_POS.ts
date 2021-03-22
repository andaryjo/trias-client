module.exports = `
<?xml version="1.0" encoding="UTF-8" ?>
<Trias version="1.2" xmlns="http://www.vdv.de/trias" xmlns:siri="http://www.siri.org.uk/siri" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://raw.githubusercontent.com/VDVde/TRIAS/v1.2/Trias.xsd">
    <ServiceRequest>
        <siri:RequestorRef>$TOKEN</siri:RequestorRef>
        <RequestPayload>
            <LocationInformationRequest>
                <InitialInput>
                    <GeoRestriction>
                        <Circle>
                            <Center>
                                <Longitude>$LONGITUDE</Longitude>
                                <Latitude>$LATITUDE</Latitude>
                            </Center>
                            <Radius>$RADIUS</Radius>
                        </Circle>
                    </GeoRestriction>
                </InitialInput>
                <Restrictions>
                    <Type>stop</Type>
                    <NumberOfResults>$MAXRESULTS</NumberOfResults>
                </Restrictions>
            </LocationInformationRequest>
        </RequestPayload>
    </ServiceRequest>
</Trias>
`;