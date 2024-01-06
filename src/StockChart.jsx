/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const StockChart = ({ data, N, K }) => {
    const chartRef = useRef(null);



    const drawChart = useCallback(() => {
        const width = 1228;
        const height = 800;
        const marginTop = 10;
        const marginRight = 20;
        const marginBottom = 30;
        const marginLeft = 40;

        const values = Float64Array.from(data, d => d.sgv);

        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .rangeRound([marginLeft, width - marginRight]);

        const y = d3.scaleLog()
            .domain(d3.extent(values))
            .rangeRound([height - marginBottom - 20, marginTop]);

        const line = d3.line()
            .defined((y, i) => !isNaN(data[i].date) && !isNaN(y))
            .x((d, i) => x(data[i].date))
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
            .attr("fill", "none")
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .selectAll()
            .data([values, ...bollinger(values, N, [-K, 0, +K])])
            .join("path")
            .attr("stroke", (d, i) => ["#aaa", "green", "blue", "red"][i])
            .attr("d", line);

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

    }, [K, N, data]);

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
                bands[j][i] = mean + deviation * K[j];
            }
            const value0 = values[i - N + 1];
            sum -= value0;
            sum2 -= value0 ** 2;
        }
        return bands;
    };
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
    }, [data, N, K]);


    return <svg ref={chartRef} />;
};

export default StockChart;
