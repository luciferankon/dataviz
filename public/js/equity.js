const chartSize = { width: 1380, height: 720 };
const margin = { left: 100, right: 10, top: 20, bottom: 150 };
const width = chartSize.width - margin.left - margin.right;
const height = chartSize.height - margin.top - margin.bottom;
let configIndex = -1;

const configs = [["Close", d => `₹ ${d}`]];

const slow = () =>
	d3
		.transition()
		.duration(1000)
		.ease(d3.easeLinear);

const updatePrices = (quotes, [fieldName, tickFormat]) => {
	const g = d3.select("#chart-area svg .prices");
	const closePrice = d3.select("#chart-area svg .prices .close");
	const sma = d3.select("#chart-area svg .prices .sma");
	const fq = _.first(quotes).time;
	const lq = _.last(quotes).time;
	const minClose = _.get(_.minBy(quotes, fieldName), fieldName, 0);
	const validSmas = _.filter(quotes, "sma");
	const minAvg = _.get(_.minBy(validSmas, "sma"), "sma", 0);
	const maxClose = _.get(_.maxBy(quotes, fieldName), fieldName, 0);

	const y = d3
		.scaleLinear()
		.domain([Math.min(minClose, minAvg), maxClose])
		.range([height, 0]);

	g.select(".y.axis-label").text(fieldName);

	const yAxis = d3
		.axisLeft(y)
		.ticks(10)
		.tickFormat(tickFormat);

	g.select(".y.axis").call(yAxis);

	const x = d3
		.scaleTime()
		.domain([fq, lq])
		.range([0, width]);

	const xAxis = d3.axisBottom(x);
	g.select(".x-axis").call(xAxis);

	const line = fieldName =>
		d3
			.line()
			.x(q => x(q.time))
			.y(q => y(q[fieldName]));

	sma.attr("d", line("sma")(_.filter(quotes, "sma")));
	console.log(_.filter(quotes, "sma"));

	closePrice.attr("d", line("Close")(quotes));
	// rects
	// 	.enter()
	// 	.append("rect")
	// 	.attr("x", b => x(b.Name))
	// 	.attr("y", () => y(0))
	// 	.attr("fill", b => color(b.Name))
	// 	.merge(rects)
	// 	.transition(slow())
	// 	.attr("height", b => y(0) - y(b[fieldName]))
	// 	.attr("width", x.bandwidth)
	// 	.attr("x", c => x(c.Name))
	// 	.attr("y", b => y(b[fieldName]));

	// rects.exit().remove();
};

const drawChart = () => {
	const svg = d3
		.select("#chart-area svg")
		.attr("height", chartSize.height)
		.attr("width", chartSize.width);

	const g = svg
		.append("g")
		.attr("class", "prices")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	g.append("text")
		.attr("class", "x axis-label")
		.attr("x", width / 2)
		.attr("y", height + margin.bottom - margin.top)
		.text("Time");

	g.append("text")
		.attr("class", "y axis-label")
		.attr("x", -height / 2)
		.attr("y", -60)
		.text("Close")
		.attr("transform", "rotate (-90)");

	g.append("g")
		.attr("class", "x-axis")
		.attr("transform", `translate(0,${height})`);

	g.append("g").attr("class", "y axis");

	g.append("path").attr("class", "close");

	g.append("path").attr("class", "sma");
};

const nextStep = () => {
	configIndex = ++configIndex % configs.length;
	return configs[configIndex];
};

const add = (x, y) => x + y;

const analyzeData = (quotes, windowSize, smaOffset) => {
	for (let index = 0; index < quotes.length; index++) {
		const from = Math.max(0, index - windowSize - smaOffset);
		const to = index - smaOffset > windowSize ? index - smaOffset : 0;
		const sum = quotes.slice(from, to).reduce((x, y) => add(x, y.Close), 0);
		quotes[index]["sma"] = _.round(sum / windowSize);
	}
};

const isBetween = (firstDate, lastDate, quote) => {
	return quote.time > firstDate && quote.time < lastDate;
};

const initSlider = function(quotes) {
	const firstDate = _.first(quotes).time.getTime();
	const lastDate = _.last(quotes).time.getTime();
	const slider = createD3RangeSlider(firstDate, lastDate, "#slider-container");

	slider.onChange(function(newRange) {
		const startDate = new Date(newRange.begin).toJSON().split("T")[0];
		const endDate = new Date(newRange.end).toJSON().split("T")[0];
		d3.select("#range-label").text(startDate + " - " + endDate);
		const updatedQuotes = quotes.filter(quote =>
			isBetween(new Date(newRange.begin), new Date(newRange.end), quote)
		);
		updatePrices(updatedQuotes, nextStep());
	});

	slider.range(firstDate, lastDate);
};

const startVisualization = (quotes, smaPeriod, smaOffset) => {
	analyzeData(quotes, smaPeriod, smaOffset);
	drawChart();

	initSlider(quotes);
	updatePrices(quotes, nextStep());
	// setInterval(() => updateChart(companies, nextStep()), 1000);
	// frequentlyMoveCompanies(companies, []);
};

const parseEquity = ({ Date, Volume, ...rest }) => {
	_.forEach(rest, (v, k) => (rest[k] = +v));
	return { Date, time: new globalThis.Date(Date), ...rest };
};

const updateOnSma = quotes => {
	const smaPeriod = document.getElementById("sma-period-input").value;
	const smaOffset = document.getElementById("sma-offset-input").value;
	analyzeData(quotes, smaPeriod, smaOffset);
	updatePrices(quotes, nextStep());
};

const main = () => {
	d3.csv("data/nifty.csv", parseEquity).then(quotes => {
		startVisualization(quotes, 100, 0);
		document.getElementById("sma-period-input").onchange = updateOnSma.bind(
			null,
			quotes
		);
		document.getElementById("sma-offset-input").onchange = updateOnSma.bind(
			null,
			quotes
		);
	});
};

window.onload = main;
