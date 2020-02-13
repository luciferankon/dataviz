const drawBuildings = buildings => {
	const toLine = b => `<strong>${b.name}</strong> <i>${b.height}</i>`;
	const maxHeight = _.maxBy(buildings, "height").height;
	const CHART_SIZE = {
		width: 600,
		height: 400
	};
	const MARGIN = {
		left: 100,
		right: 10,
		top: 10,
		bottom: 150
	};

	const WIDTH = CHART_SIZE.width - MARGIN.left - MARGIN.right;
	const height = CHART_SIZE.height - MARGIN.top - MARGIN.bottom;

	const y = d3
		.scaleLinear()
		.domain([0, maxHeight])
		.range([height, 0]);

	const x = d3
		.scaleBand()
		.range([0, WIDTH])
		.domain(_.map(buildings, "name"))
		.padding(0.3);

	const svg = d3
		.select("#chart-data")
		.append("svg")
		.attr("width", CHART_SIZE.width)
		.attr("height", CHART_SIZE.height);

	const g = svg
		.append("g")
		.attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

	g.append("text")
		.attr("class", "x axis-label")
		.attr("x", WIDTH / 2)
		.attr("y", height + 140)
		.text("Tall buildings");

	g.append("text")
		.attr("class", "y axis-label")
		.text("Height(m)")
		.attr("transform", "rotate(-90)")
		.attr("x", -height / 2)
		.attr("y", -60);

	const yAxis = d3
		.axisLeft(y)
		.tickFormat(d => d + "m")
		.ticks(3);

	g.append("g")
		.attr("class", "y-axis")
		.call(yAxis);

	const xAxis = d3.axisBottom(x);

	g.append("g")
		.attr("class", "x-axis")
		.call(xAxis)
		.attr("transform", `translate(0,${height})`);

	g.selectAll(".x-axis text")
		.attr("transform", "rotate(-40)")
		.attr("text-anchor", "end")
		.attr("x", -5)
		.attr("y", 10);

	const rectangles = g.selectAll("rect").data(buildings);
	const newRects = rectangles.enter().append("rect");
	newRects
		.attr("x", b => x(b.name))
		.attr("y", b => y(b.height))
		.attr("width", x.bandwidth)
		.attr("height", b => y(0) - y(b.height));

	document.querySelector("#chart-area").innerHTML = buildings
		.map(toLine)
		.join("<hr/>");
};

const main = () => {
	d3.json("data/buildings.json").then(drawBuildings);
};

window.onload = main;
