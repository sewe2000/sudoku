import { useEffect, useRef, useState } from "react";
import timerStyle from './timer.module.css';

const Timer = ({setTime}: {setTime: Function}) => {
    const [seconds, setSeconds] = useState<number>(0);
    const timer = useRef<Date>(new Date(0, 0, 0, 0));
    const INTERVALTIME = 1000;
    timer.current.setTime(seconds * 1000);

    useEffect(() => {
        setTime(0);
        const interval = setInterval(() => {
            setSeconds((previousSeconds: number) => previousSeconds + 1);
            setTime((previousSeconds: number) => previousSeconds + 1);
        }, INTERVALTIME);
        return () => clearInterval(interval);
    }, [setTime]);

    return (
        <div className={timerStyle.timer}>
            {timer.current.toLocaleTimeString('pl-PL', { timeZone: 'UTC' })}
        </div>
    )
};
export default Timer;
