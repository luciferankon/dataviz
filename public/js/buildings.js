const drawBuildings = buildings => {
	const toLine = b => `<strong>${b.name}</strong> <i>${b.height}</i>`;
	const svgHeight = 400;
	const svgWidth = 400;
	const maxHeight = _.maxBy(buildings, "height").height;

	const y = d3
		.scaleLinear()
		.domain([0, maxHeight])
		.range([0, svgHeight]);

	const x = d3
		.scaleBand()
		.range([0, svgWidth])
		.domain(_.map(buildings, "name"))
		.padding(0.3);

	const svg = d3
		.select("#chart-data")
		.append("svg")
		.attr("width", svgWidth)
		.attr("height", svgHeight);

	const rectangles = svg.selectAll("rect").data(buildings);
	const newRects = rectangles.enter().append("rect");
	newRects
		.attr("x", b => x(b.name))
		.attr("width", x.bandwidth)
		.attr("height", b => y(b.height));

	document.querySelector("#chart-area").innerHTML = buildings
		.map(toLine)
		.join("<hr/>");
};

const main = () => {
	d3.json("data/buildings.json").then(drawBuildings);
};

window.onload = main;
