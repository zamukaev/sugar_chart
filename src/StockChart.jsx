/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

const StockChart = ({ data, N, K }) => {
    const chartRef = useRef(null);
    const [timePeriod, setTimePeriod] = useState("year");
    const currentData = Math.floor(data.length / 2)
    const [timeValue, setTimeValue] = useState(currentData)
    const filtredData = data.slice(0, timeValue);
    console.log(timeValue)
    const drawChart = useCallback(() => {
        const width = 1228;
        const height = 800;
        const marginTop = 10;
        const marginRight = 20;
        const marginBottom = 30;
        const marginLeft = 40;

        const values = Float64Array.from(filtredData, d => d.sgv);

        const x = d3.scaleTime()
            .domain(d3.extent(filtredData, d => d.date))
            .rangeRound([marginLeft, width - marginRight]);

        const y = d3.scaleLog()
            .domain(d3.extent(values))
            .rangeRound([height - marginBottom - 20, marginTop]);

        const line = d3.line()
            .defined((y, i) => !isNaN(filtredData[i].date) && !isNaN(y))
            .x((d, i) => x(filtredData[i].date))
            .y(y);


        const svg = d3.select(chartRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto;");

        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(d3.axisBottom(x).ticks(width / 70))
            .call(g => g.select(".domain").remove());

        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y).tickValues(d3.ticks(...y.domain(), 40)).tickFormat(d => d))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").clone()
                .attr("x2", width - marginLeft - marginRight)
                .attr("stroke-opacity", 0.1))
            .call(g => g.select(".tick:last-of-type text").clone()
                .attr("x", 3)
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .text("↑ Daily close ($)"));

        svg.append("g")

            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .selectAll()
            .data([values, ...bollinger(values, N, [-K, 0, +K])])
            .join("path")
            .attr("stroke", (d, i) => ["white", "green", "blue", "red"][i])
            .attr("stroke-width", (d, i) => [1.5, 1.5, 1.5, 1.5][i])
            .attr("fill", (d, i) => ["none", "none", "none", "none"][i])
            .attr("d", line);
        // var group = svg.append("g")
        //     .attr("stroke-linejoin", "round")
        //     .attr("stroke-linecap", "round");

        // // Define the area generator (as before)
        // var area = d3.area()
        //     .x(function (d, i) { return x(d.x); }) // Adjust for your data
        //     .y0(function (d) { return y(d[0]); }) // Upper boundary (green line)
        //     .y1(function (d) { return y(d[1]); }); // Lower boundary (blue line)

        // // Append the area path to the group
        // group.append("path")
        //     .datum(values.map((d, i) => [d, bollinger(values, N, [-K, 0, +K])[1][i]])) // Combining values for green and blue lines
        //     .attr("fill", "rgba(187, 187, 187, 0.07)") // Transparent gray color
        //     .attr("d", area);

        // // Then append the line paths (as in your existing code)
        // group.selectAll()
        //     .data([values, ...bollinger(values, N, [-K, 0, +K])])
        //     .join("path")
        //     .attr("stroke", (d, i) => ["white", "green", "blue", "red"][i])
        //     .attr("stroke-width", (d, i) => [1.5, 1.5, 1.5, 1.5][i])
        //     .attr("fill", (d, i) => ["none", "none", "none", "#bbbbbb12"][i])
        //     .attr("d", line);


        // Hinzufügen der roten Linie bei einem Zuckerpegel von 180
        svg.append("line")
            .attr("x1", marginLeft)
            .attr("y1", y(180))
            .attr("x2", width - marginRight)
            .attr("y2", y(180))
            .attr("stroke", "red")
            .attr("stroke-dasharray", "5.5");

        // Hinzufügen der blauen Linie bei einem Zuckerpegel von 80
        svg.append("line")
            .attr("x1", marginLeft)
            .attr("y1", y(80))
            .attr("x2", width - marginRight)
            .attr("y2", y(80))
            .attr("stroke", "blue")
            .attr("stroke-dasharray", "5.5");

    }, [K, N, filtredData]);


    const bollinger = (values, N, K) => {
        //console.log(values, N, K);

        let i = 0;
        let sum = 0;
        let sum2 = 0;
        const bands = K.map(() => new Float64Array(values.length).fill(NaN));
        for (let n = Math.min(N - 1, values.length); i < n; ++i) {
            const value = values[i];
            sum += value;
            sum2 += value ** 2;
        }
        for (let n = values.length, m = bands.length; i < n; ++i) {
            const value = values[i];
            sum += value;
            sum2 += value ** 2;
            const mean = sum / N;
            const deviation = Math.sqrt((sum2 - sum ** 2 / N) / (N - 1));
            for (let j = 0; j < K.length; ++j) {
                bands[j][i - Math.floor(N / 2)] = mean + deviation * K[j];
            }
            const value0 = values[i - N + 1];
            sum -= value0;
            sum2 -= value0 ** 2;
        }
        // console.log("bands", bands)
        // console.log("bands1", bands[1])
        // console.log("bands2", bands[2])
        // const a0 = new Float64Array([...bands[0], ...bands[0].reverse()])
        // const a1 = new Float64Array([...bands[1], ...bands[1].reverse()])
        // const a2 = new Float64Array([...bands[0], ...bands[2].reverse()])

        // const bandsArea = [a0, a1, a2]
        // console.log(bandsArea)
        return bands;
    };

    const changeTimePeriod = (event) => {
        const delta = event.deltaY;

        if (delta >= 0) {
            if (timeValue <= data.length - 10) {
                setTimeValue(prev => prev + 10)
            }
        } else {
            if (timeValue >= 60) {
                setTimeValue(timeValue - 10)
            }

        }
    }

    const mouseEnter = () => {
        document.body.style = "overflow:hidden"
    }
    const mouseLeave = () => {
        document.body.style = "overflow:scroll"
    }


    useEffect(() => {
        if (data && data.length > 0) {
            // Lösche vorhandenes SVG-Element
            const chartNode = chartRef.current;
            while (chartNode.firstChild) {
                chartNode.removeChild(chartNode.firstChild);
            }

            // Zeichne die Chart mit den aktualisierten N und K
            drawChart();
        }
    }, [data, timeValue, currentData, N, K]);

    return <svg ref={chartRef} onMouseLeave={mouseLeave} onMouseEnter={mouseEnter} onWheel={changeTimePeriod} />;
};

export default StockChart;
