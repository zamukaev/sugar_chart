import './App.css'
import { entries } from '../db/db'
import StockChart from './StockChart';
import { useState } from 'react';

function App() {
    const [valueN, setValueN] = useState(2)
    const [valueK, setValueK] = useState(0)

    const sortedArray = entries.sort((a, b) => a.date - b.date);
    console.log(entries)
    return (
        <div className='chart'>
            <div>
                <div>value N: {valueN}</div>
                <input
                    onChange={(event) => setValueN(event.target.value)}
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
            <div>

                <StockChart data={sortedArray.slice(100, 500)} N={valueN} K={valueK} />
            </div>
        </div>
    )
}

export default App
