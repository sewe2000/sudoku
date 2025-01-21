import style from '@/app/ui/components/scoreboard/scoreboard.module.css';
import {Color} from '../button/button';
import Button from '../button/button';

interface ScoreboardProps {
    scores: number[];
    setHasGameEnded: Function;
    setHasGameStarted: Function;
    setHasBeenCalled: Function;
};

const Scoreboard = (props: ScoreboardProps) => {
  const secondsToTimeDisplay = (seconds:number): string => {
        const date = new Date(0, 0, 0, 0);
        date.setTime(seconds * 1000);
        return date.toLocaleTimeString('pl-PL', { timeZone: 'UTC' });
  };

  const onClick = () => {
    props.setHasBeenCalled(false);
    props.setHasGameEnded(false);
    props.setHasGameStarted(false);
  };
  return (
        <>
            {props.scores.length === 0 && <h1 className={style.h1} >You have no records yet</h1>}
            {props.scores.length === 1 && <h1 className={style.h1}>Here is the best time</h1> }
            {props.scores.length > 1 && <h1 className={style.h1}>Here are top {props.scores.length} times</h1> }
            <div className={style.container}>
                <ol className={style.ol}>
                    {
                        props.scores.map((item: number, index:number) => ( <li key={index}>{secondsToTimeDisplay(item)}</li>))
                    }
                </ol>
            </div>
            <div className={style.container}>
                <Button onClick={onClick} text='Return' color={Color.white}/>
            </div>
        </>
    );
};

export default Scoreboard;
