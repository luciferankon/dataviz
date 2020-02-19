const chartSize = { width: 800, height: 600 };
const margin = { left: 100, right: 10, top: 20, bottom: 150 };
const width = chartSize.width - margin.left - margin.right;
const height = chartSize.height - margin.top - margin.bottom;
const color = d3.scaleOrdinal(d3.schemeCategory10);
let configIndex = -1;

const configs = [
	["CMP", d => `₹ ${d}`],
	["MarketCap", d => `₹ ${d / 1000}k Cr`],
	["PE", d => `${d}`],
	["DivYld", d => `${d}%`],
	["ROCE", d => `${d}%`]
];

const slow = () =>
	d3
		.transition()
		.duration(1000)
		.ease(d3.easeLinear);

const updateChart = (companies, [fieldName, tickFormat]) => {
	const g = d3.select("#chart-area svg .companies");
	const rects = g.selectAll("rect").data(companies, c => c.Name);

	const maxValue = _.get(_.maxBy(companies, fieldName), fieldName, 0);
	const y = d3
		.scaleLinear()
		.domain([0, maxValue])
		.range([height, 0]);

	g.select(".y.axis-label").text(fieldName);

	const yAxis = d3
		.axisLeft(y)
		.ticks(10)
		.tickFormat(tickFormat);

	g.select(".y.axis").call(yAxis);

	const x = d3
		.scaleBand()
		.domain(_.map(companies, "Name"))
		.range([0, width])
		.padding(0.6);

	const xAxis = d3.axisBottom(x);
	g.select(".x-axis").call(xAxis);

	rects
		.enter()
		.append("rect")
		.attr("x", b => x(b.Name))
		.attr("y", () => y(0))
		.attr("fill", b => color(b.Name))
		.merge(rects)
		.transition(slow())
		.attr("height", b => y(0) - y(b[fieldName]))
		.attr("width", x.bandwidth)
		.attr("x", c => x(c.Name))
		.attr("y", b => y(b[fieldName]));

	rects.exit().remove();
};

const drawChart = () => {
	const svg = d3
		.select("#chart-area svg")
		.attr("height", chartSize.height)
		.attr("width", chartSize.width);

	const g = svg
		.append("g")
		.attr("class", "companies")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	g.append("text")
		.attr("class", "x axis-label")
		.attr("x", width / 2)
		.attr("y", height + margin.bottom - margin.top)
		.text("Companies");

	g.append("text")
		.attr("class", "y axis-label")
		.attr("x", -height / 2)
		.attr("y", -60)
		.text("CMP")
		.attr("transform", "rotate (-90)");

	g.append("g")
		.attr("class", "x-axis")
		.attr("transform", `translate(0,${height})`);

	g.append("g").attr("class", "y axis");
};

const parseCompany = ({ Name, ...rest }) => {
	_.forEach(rest, (v, k) => (rest[k] = +v));
	return { Name, ...rest };
};

const frequentlyMoveCompanies = (src, dest) => {
	setInterval(() => {
		const c = src.shift();
		if (c) dest.push(c);
		else [src, dest] = [dest, src];
	}, 1000);
};

const nextStep = () => {
	configIndex = ++configIndex % configs.length;
	return configs[configIndex];
};

const startVisualization = companies => {
	drawChart();
	updatePrices(companies, nextStep());
	setInterval(() => updatePrices(companies, nextStep()), 1000);
	frequentlyMoveCompanies(companies, []);
};

const main = () => {
	d3.csv("data/companies.csv", parseCompany).then(startVisualization);
};

window.onload = main;
