/* eslint-disable @typescript-eslint/no-var-requires */
const { parseResponse } = require("../lib/RequestAndParse");

const docWithTriasNs = `\
<?xml version="1.0" encoding="UTF-8"?>
<Trias xmlns="http://www.vdv.de/trias" version="1.2">
	<trias:foo />
	<bar>trias:</bar>
	<trias:baz>_</trias:baz>
</Trias>
`;

describe("Test parsing", () => {
	it("Should strip TRIAS namespace", () => {
		const doc = parseResponse(docWithTriasNs)
		const triasEl = doc.children.find(c => c.type === "tag" && c.name === "Trias")

		const childTags = triasEl.children
			.filter(c => c.type === "tag")
			.map(c => c.name);
		expect(childTags).toEqual(["foo", "bar", "baz"]) // strips NS from tag names

		const barEl = triasEl.children.find(c => c.type === "tag" && c.name === "bar")
		const barText = barEl.children.find(c => c.type === "text")
		expect(barText.data).toBe("trias:") // does not strip text content
	});
});
