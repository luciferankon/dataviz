const chartSize = { width: 800, height: 600 };
const margin = { left: 100, right: 10, top: 20, bottom: 150 };
const width = chartSize.width - margin.left - margin.right;
const height = chartSize.height - margin.top - margin.bottom;

const t = d3
	.transition()
	.duration(1000)
	.ease(d3.easeLinear);

const updateChart = (companies, [fieldName, tickFormat]) => {
	const svg = d3.select("#chart-area svg");

	const maxValue = _.get(_.maxBy(companies, fieldName), fieldName, 0);
	const y = d3
		.scaleLinear()
		.domain([0, maxValue])
		.range([height, 0]);

	svg.select(".y.axis-label").text(fieldName);

	const yAxis = d3
		.axisLeft(y)
		.ticks(10)
		.tickFormat(tickFormat);

	svg.select(".y.axis").call(yAxis);

	const x = d3
		.scaleBand()
		.domain(_.map(companies, "Name"))
		.range([0, width])
		.padding(0.6);

	const xAxis = d3.axisBottom(x);
	svg.select(".x-axis").call(xAxis);

	svg
		.selectAll("g rect")
		.data(companies, (c, i) => c.Name)
		.transition(t)
		.attr("height", b => y(0) - y(b[fieldName]))
		.attr("width", x.bandwidth)
		.attr("x", c => x(c.Name))
		.attr("y", b => y(b[fieldName]));

	svg
		.selectAll("g rect")
		.data(companies, (c, i) => c.Name)
		.exit()
		.remove()
		.transition(t);
};

const drawChart = (companies, [fieldName, tickFormat]) => {
	const svg = d3
		.select("#chart-area")
		.append("svg")
		.attr("height", chartSize.height)
		.attr("width", chartSize.width);

	const y = d3
		.scaleLinear()
		.domain([0, _.maxBy(companies, fieldName)[fieldName]])
		.range([height, 0]);

	const x = d3
		.scaleBand()
		.domain(_.map(companies, "Name"))
		.range([0, width])
		.padding(0.6);

	const color = d3.scaleOrdinal(d3.schemeCategory10);
	const xAxis = d3.axisBottom(x);
	const yAxis = d3
		.axisLeft(y)
		.ticks(10)
		.tickFormat(tickFormat);

	const g = svg
		.append("g")
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
		.call(xAxis)
		.attr("transform", `translate(0,${height})`);

	g.append("g")
		.attr("class", "y axis")
		.call(yAxis);

	const rects = g.selectAll("rect").data(companies, (c, i) => c.Name);

	const newRects = rects.enter();
	newRects
		.append("rect")
		.attr("x", b => x(b.Name))
		.attr("y", b => y(b[fieldName]))
		.attr("width", x.bandwidth)
		.attr("height", b => y(0) - y(b[fieldName]))
		.attr("fill", b => color(b.Name));
};

const parseCompany = ({ Name, ...rest }) => {
	_.forEach(rest, (v, k) => (rest[k] = +v));
	return { Name, ...rest };
};

const configs = [
	["CMP", d => `₹ ${d}`],
	["MarketCap", d => `₹ ${d / 1000}k Cr`],
	["PE", d => `${d}`],
	["DivYld", d => `${d}%`],
	["ROCE", d => `${d}%`]
];

let configIndex = 0;
const startVisualization = companies => {
	drawChart(companies, configs[configIndex]);
	setInterval(() => {
		configIndex = ++configIndex % configs.length;
		updateChart(companies, configs[configIndex]);
	}, 2000);

	setInterval(() => companies.shift(), 4000);
};

const main = () => {
	d3.csv("data/companies.csv", parseCompany).then(startVisualization);
};

window.onload = main;
