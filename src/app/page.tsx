'use client'
import styles from './page.module.css';
import Button, {Color} from "@/app/ui/components/button/button";
import {useEffect, useRef, useState} from "react";
import Board, {Difficulty} from "@/app/ui/components/board/board";
import Timer from './ui/components/timer/timer';
import Scoreboard from './ui/components/scoreboard/scoreboard';

export default function Home() {
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.medium);
  const [hasGameStarted, setHasGameStarted] = useState<boolean>(false);
  const [hasGameEnded, setHasGameEnded] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const timeSaved = useRef<bool>(false);

  const fetchBestTimes = () => {
      if (typeof window === 'undefined')
        return;
      let trial = localStorage.getItem('times');
      if (!trial) {
            localStorage.setItem('times', JSON.stringify([]));
            bestTimes = '';
            return;
      }
      bestTimes = localStorage.getItem('times') ?? '';
  };

  let bestTimes: string = '';

  useEffect(() => {
    fetchBestTimes();
  }, []);
  

  const setSpecifiedDifficulty = (difficulty: Difficulty) => {
    setDifficulty(difficulty);
    setHasGameStarted(true);
  }

  const saveTime = (seconds: number) => {
    if (typeof window === 'undefined')
      return;
    const NO_TIMES = 5;
    let bestTimesArray: number[] = bestTimes? JSON.parse(bestTimes) : [];
    bestTimesArray.push(seconds);
    bestTimesArray.sort((a, b) => a - b);
    bestTimesArray = bestTimesArray.slice(0, NO_TIMES);
    
    localStorage.setItem('times', JSON.stringify(bestTimesArray));
  };
 


  if (hasGameEnded && typeof window !== 'undefined') {
    fetchBestTimes();
    if (!timeSaved.current) {
        saveTime(currentTime);
        timeSaved.current = true;
    } else {
            timeSaved.current = false;
    }
    fetchBestTimes();
    const scores: number[] = JSON.parse(bestTimes);
    return (
        <Scoreboard scores={scores} setHasGameEnded={setHasGameEnded} setHasGameStarted={setHasGameStarted}/>
    )
  }

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
        </main>
      </>
  );
}
