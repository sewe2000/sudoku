'use client'
import styles from './page.module.css';
import Button from "@/app/ui/components/button/button";
import {useState} from "react";
import Board, {Difficulty} from "@/app/ui/components/board/board";


export default function Home() {
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.medium);
  const [hasGameStarted, setHasGameStarted] = useState<boolean>(false);

  const setSpecifiedDifficulty = (difficulty: Difficulty) => {
    setDifficulty(difficulty);
    setHasGameStarted(true);
  }

  return (
      <>
        <h1 className={styles.title}>Sudoku game</h1>
        <main>
            { !hasGameStarted && <h2 className={styles.subtitle}>Choose the difficulty</h2> }
            <div className={styles.buttonContainer}>
                {
                    hasGameStarted? <Board difficulty={difficulty}/> :
                    <>
                        <Button onClick={() => setSpecifiedDifficulty(Difficulty.easy)} text="Easy" color="green" />
                        <Button onClick={() => setSpecifiedDifficulty(Difficulty.medium)} text="Medium" color="blue" />
                        <Button onClick={() => setSpecifiedDifficulty(Difficulty.hard)} text="Hard" color="red" />
                    </>
                }
          </div>
        </main>
      </>
  );
}
