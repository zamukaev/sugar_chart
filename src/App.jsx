import './App.css'
import { entries } from '../db/db'
import StockChart from './StockChart';
import { useState } from 'react';

function App() {
    const [valueN, setValueN] = useState(2)
    const [valueK, setValueK] = useState(0)
    const sortedArray = entries.sort((a, b) => a.date - b.date);
    const currentData = Math.floor(sortedArray.length / 2)
    const [timeValue, setTimeValue] = useState(currentData)

    const filtredData = sortedArray.slice(100, timeValue);

    const changeTimePeriod = (event) => {
        const delta = event.deltaY;

        if (delta >= 0) {
            if (timeValue <= entries.length - 10) {
                setTimeValue(prev => prev + 10)
            }
        } else {
            if (timeValue >= 60) {
                setTimeValue(timeValue - 10)
            }

        }
    }

    const incrementTimeValue = () => {
        if (timeValue < 400) {
            setTimeValue(prev => prev + 10)
        }
        return
    }
    const decrementTimeValue = () => {
        if (timeValue >= 160) {
            setTimeValue(prev => prev - 10)
        }
    }
    return (
        <div className='chart'>
            <div className='container'>
                <div className='range'>
                    <div>value N: {valueN}</div>
                    <input
                        onChange={(event) => setValueK(event.target.value)}
                        type="range"
                        min={2}
                        max={100}
                        value={valueN}
                    />
                    <div>value K: {valueK}</div>
                    <input
                        onChange={(event) => setValueK(event.target.value)}
                        type="range"
                        min={0}
                        max={10}
                        value={valueK}
                    />
                </div>
                <div className='rangeBtn'>
                    <div>
                        <button onClick={() => setValueN(prev => prev + 1)}>N: {valueN}</button>
                        <button onClick={() => setValueK(prev => prev + 1)}>K: {valueK}</button>
                    </div>
                    <div>
                        <button onClick={() => setValueN(prev => prev > 2 && prev - 1)}> - N: {valueN}</button>
                        <button onClick={() => setValueK(prev => prev > 1 && prev - 1)}> - K: {valueK}</button>
                    </div>
                </div>
                <div className='plus'>
                    <button onClick={incrementTimeValue}>+</button>
                    <button onClick={decrementTimeValue}>-</button>
                </div>
            </div>

            <div className='chart_item'>
                <StockChart changeTimePeriod={changeTimePeriod} data={filtredData} N={valueN} K={valueK} />
            </div>
        </div>
    )
}

export default App
