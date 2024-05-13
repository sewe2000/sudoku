import styles from '@/app/ui/components/board/board.module.css';
import {FormEvent, MutableRefObject, useEffect, useRef} from "react";

const numberOfElementsInRow = 9;
const numberOfSquaresInRow = 3;
const squareDimension = numberOfElementsInRow / numberOfSquaresInRow;
const handleInput = (event: FormEvent<HTMLInputElement>) => {
  const inputElement = event.target as HTMLInputElement;
  if (/[^1-9]/.test(inputElement.value) || inputElement.value.length > 1) {
      inputElement.value = inputElement.value.slice(0, -1);
  }
};

const handleArrows = (event: React.KeyboardEvent<HTMLInputElement>, ref: MutableRefObject<HTMLInputElement[]>) => {
  const currentInputId = Number((event.target as HTMLInputElement).id);
  const numberOfInputs = numberOfElementsInRow * numberOfElementsInRow;
  let selectedInput: HTMLInputElement;

  switch (event.key) {
    case "ArrowDown":
      if (currentInputId + 9 < numberOfInputs)
        selectedInput = ref.current[currentInputId + 9];
      else
        return;
      break;
    case "ArrowUp":
      if (currentInputId - 9 >= 0)
        selectedInput = ref.current[currentInputId - 9];
      else
        return;
      break;
    case "ArrowLeft":
      if (currentInputId - 1 >= 0)
        selectedInput = ref.current[currentInputId - 1];
      else
        return;
      break;
    case "ArrowRight":
      if (currentInputId + 1 < numberOfInputs)
        selectedInput = ref.current[currentInputId + 1];
      else
        return;
      break;
    default:
      return;
  }
  selectedInput.setSelectionRange(selectedInput.value.length - 1, selectedInput.value.length - 1);
  selectedInput.focus();
};

const getRandomNumber = (min: number, max: number): number => min == max? min : Math.floor(Math.random() * (max - min - 1) + min);
const getRowFromIndex = (index: number) => Math.floor(index / numberOfElementsInRow);
const getColumnFromIndex = (index: number) => index % numberOfElementsInRow;
const getSquareFromIndex = (index: number) =>
    Math.floor(getRowFromIndex(index) / squareDimension) * numberOfSquaresInRow +
    Math.floor(getColumnFromIndex(index) / squareDimension);

const initBoard = (difficulty: Difficulty, inputsRef: MutableRefObject<HTMLInputElement[]>, boardState: InternalState,
                   exampleSolve: (number|null)[]) => {

  inputsRef.current.forEach((element) => element.value = '');

  let numberOfNumsPerSquare = 0;
  switch(difficulty) {
    case Difficulty.easy:
      numberOfNumsPerSquare = 7;
      break;
    case Difficulty.medium:
      numberOfNumsPerSquare = 5;
      break;
    case Difficulty.hard:
      numberOfNumsPerSquare = 3;
      break;
  }
  for (let i = 0; i < numberOfElementsInRow * numberOfNumsPerSquare; i++) {
      const randomIndex = getRandomNumber(0, numberOfElementsInRow * numberOfElementsInRow - 1);
      const numberToBeInserted = exampleSolve[randomIndex];

      const row = getRowFromIndex(randomIndex);
      const col = getColumnFromIndex(randomIndex);
      const square = getSquareFromIndex(randomIndex);

      inputsRef.current[randomIndex].value = numberToBeInserted? numberToBeInserted.toString() : '';
      inputsRef.current[randomIndex].disabled = true;
      if (numberToBeInserted) {
          boardState.rows[row].add(numberToBeInserted);
          boardState.cols[col].add(numberToBeInserted);
          boardState.squares[square].add(numberToBeInserted);
      }
    }
};

interface FillCellInterface {
    index: number;
    cellArray: (number|null)[];
    state: InternalState;
    squaresStatus: Set<number>[];
    availableNumbers: number[];
}
function fillCell(data: FillCellInterface): boolean {

    const row = getRowFromIndex(data.index);
    const col = getColumnFromIndex(data.index);
    const square = getSquareFromIndex(data.index);

    const availableNumbers = data.availableNumbers.filter(number =>
        data.squaresStatus[data.index].has(number) &&
        !data.state.rows[row].has(number) &&
        !data.state.cols[col].has(number) &&
        !data.state.squares[square].has(number));
    const availableNumbersIndex = getRandomNumber(0, availableNumbers.length - 1);
    const chosenNumber = availableNumbers[availableNumbersIndex];

    data.squaresStatus[data.index].delete(chosenNumber);
    data.cellArray[data.index] = chosenNumber;
    data.state.rows[row].add(chosenNumber);
    data.state.cols[col].add(chosenNumber);
    data.state.squares[square].add(chosenNumber);
    return true;
}


function shuffleArray(array: any[]): any[]{
    let currentIndex = array.length,  randomIndex;

    while (currentIndex > 0) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

function generateExampleSudoku(sudokuArray: (number|null)[]) {

    const numbersArray: number[] = Array.from(Array(numberOfElementsInRow).keys()).map(number => number + 1);
    const sudokuState: InternalState = {
        rows: Array(numberOfElementsInRow).fill(null).map(() => new Set<number>()),
        cols: Array(numberOfElementsInRow).fill(null).map(() => new Set<number>()),
        squares: Array(numberOfElementsInRow).fill(null).map(() => new Set<number>()),
    };

    const squares: Set<number>[] =
        Array(numberOfElementsInRow**2).fill(null).map(() => new Set<number>(numbersArray));

    let sudoku2d: number[][] = Array(numberOfElementsInRow).fill(null).map(() => new Array(numberOfElementsInRow));
    for(let i = 0; i < numberOfElementsInRow; i++) {
        fillCell({
            index: i,
            cellArray: sudoku2d[0],
            state: sudokuState,
            squaresStatus: squares,
            availableNumbers: numbersArray
        });
    }
    for(let i = 1; i < numberOfElementsInRow; i++) {
        sudoku2d[i] = [...sudoku2d[i - 1]];
        sudoku2d[i] = sudoku2d[i].concat(sudoku2d[i].splice(0,
            (i + 1) % squareDimension == 1 ? 1 : squareDimension)); // shift by some places
    }

    const flatSudoku = sudoku2d.flat(1);
    for (const index in sudokuArray) {
        sudokuArray[index] = flatSudoku[index];
    }
}

export enum Difficulty {
  easy = "easy",
  medium = "medium",
  hard = "hard"
}
interface BoardProps {
  difficulty: Difficulty;
}

interface InternalState {
  rows:  Set<number>[];
  cols:  Set<number>[];
  squares:  Set<number>[];
}

export default function Board(props: BoardProps) {
  const inputsRef: MutableRefObject<HTMLInputElement[]> = useRef(new Array(numberOfElementsInRow * numberOfElementsInRow));

  const internalState = useRef<InternalState>({
    rows: Array(numberOfElementsInRow).fill(null).map(_ => new Set<number>()),
    cols: Array(numberOfElementsInRow).fill(null).map(_ => new Set<number>()),
    squares: Array(numberOfElementsInRow).fill(null).map(_ => new Set<number>()),
  });
  const exampleSudoku: (number|null)[] = new Array(numberOfElementsInRow * numberOfElementsInRow).fill(null);
  let inputCounter = 0;

  generateExampleSudoku(exampleSudoku);
  useEffect(() => {
      initBoard(props.difficulty, inputsRef, internalState.current, exampleSudoku)
      const tempRef = [...inputsRef.current];
      return () => tempRef.forEach((inputElement) => {
          inputElement.removeAttribute('disabled');
          inputElement.value = '';
      })
  });

  const tdElements = [...Array(numberOfElementsInRow * numberOfElementsInRow)].map((_, i) =>
      <td key={i}>
        <input onChange={handleInput} onKeyDown={event => handleArrows(event, inputsRef)}
                         id={`${inputCounter++}`} ref={ (node) => {
          if (node) {
            inputsRef.current[Number(node.id)] = node;
          } else {
            delete inputsRef.current[inputCounter - 1];
          }
      }
      }/>
      </td>);
  const trElements = [...Array(numberOfElementsInRow)].map((_, i) =>
    <tr key={i}>{tdElements.slice(i * numberOfElementsInRow, i * numberOfElementsInRow + numberOfElementsInRow)}</tr>);


  return (
      <table className={styles.table}>
          <tbody>
          { ...trElements }
          </tbody>
      </table>
  );
}
