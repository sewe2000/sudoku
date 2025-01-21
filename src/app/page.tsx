'use client'
import styles from './page.module.css';
import Button, {Color} from "@/app/ui/components/button/button";
import {memo, useCallback, useEffect, useRef, useState} from "react";
import Board, {Difficulty} from "@/app/ui/components/board/board";
import Timer from './ui/components/timer/timer';
import Scoreboard from './ui/components/scoreboard/scoreboard';

export default function Home() {
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.medium);
  const [hasGameStarted, setHasGameStarted] = useState<boolean>(false);
  const [hasGameEnded, setHasGameEnded] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [hasScoreboardBeenCalled, setHasScoreboardBeenCalled] = useState<boolean>(false);
  const timeSaved = useRef<boolean>(false);
  const bestTimes = useRef<string>('');

  const fetchBestTimes = () => {
      if (typeof window === 'undefined')
        return;
      let trial = localStorage.getItem('times');
      if (!trial) {
            localStorage.setItem('times', JSON.stringify([]));
            bestTimes.current = '';
            return;
      }
      bestTimes.current = localStorage.getItem('times') ?? '';
  };


  const memoizedFetcher = useCallback(fetchBestTimes, []);
  useEffect(() => {
        memoizedFetcher();
  }, [memoizedFetcher]);
  

  const setSpecifiedDifficulty = (difficulty: Difficulty) => {
    setDifficulty(difficulty);
    setHasGameStarted(true);
  }

  const saveTime = (seconds: number) => {
    if (typeof window === 'undefined')
      return;
    const NO_TIMES = 5;
    let bestTimesArray: number[] = bestTimes.current? JSON.parse(bestTimes.current) : [];
    bestTimesArray.push(seconds);
    bestTimesArray.sort((a, b) => a - b);
    bestTimesArray = bestTimesArray.slice(0, NO_TIMES);
    
    localStorage.setItem('times', JSON.stringify(bestTimesArray));
  };
 


  if (hasGameEnded && typeof window !== 'undefined') {
    fetchBestTimes();
    if (!timeSaved.current && !hasScoreboardBeenCalled) {
        saveTime(currentTime);
        timeSaved.current = true;
    } else {
            timeSaved.current = false;
    }
    fetchBestTimes();
    const scores: number[] = JSON.parse(bestTimes.current);
    return (
        <Scoreboard scores={scores}
                    setHasGameEnded={setHasGameEnded}
                    setHasGameStarted={setHasGameStarted}
                    setHasBeenCalled={setHasScoreboardBeenCalled}
        />
    )
  }

  const showLedger = () => {
    setHasScoreboardBeenCalled(true);
    setHasGameEnded(true);
  };

  return (
      <>
        <h1 className={styles.title}>Sudoku game</h1>
        <main>
            { hasGameStarted && !hasGameEnded && <Timer setTime={setCurrentTime}/> }
            { !hasGameStarted && <h2 className={styles.subtitle}>Choose the difficulty</h2> }
            <div className={!hasGameStarted? styles.buttonContainer : styles.centerContainer}>
                {
                    hasGameStarted? <Board difficulty={difficulty} setHasGameStarted={setHasGameStarted} setHasGameEnded={setHasGameEnded}/> :
                    <>
                        <Button onClick={() => setSpecifiedDifficulty(Difficulty.easy)} text="Easy" color={Color.green} />
                        <Button onClick={() => setSpecifiedDifficulty(Difficulty.medium)} text="Medium" color={Color.blue} />
                        <Button onClick={() => setSpecifiedDifficulty(Difficulty.hard)} text="Hard" color={Color.red} />
                    </>
                }
          </div>
          { !hasGameStarted &&
          <div className={styles.centerContainer}>
                <Button text='Ledger' color={Color.white} onClick={showLedger}/>
          </div> }
        </main>
      </>
  );
}
