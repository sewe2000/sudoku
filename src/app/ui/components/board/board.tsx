import styles from '@/app/ui/components/board/board.module.css';
import {
    ChangeEvent,
    ChangeEventHandler,
    Children,
    KeyboardEventHandler,
    MutableRefObject,
    ReactElement,
    useEffect,
    useRef,
    useState
} from "react";
import Button, { Color } from '../button/button';

const numberOfElementsInRow = 9;
const numberOfElementsInColumn = 9;
const numberOfRows = 9;
const numberOfSquaresInRow = 3;
const squareDimension = numberOfElementsInRow / numberOfSquaresInRow;
let lastInsertedNumber = 0;

type Sudoku = (number|null)[];

function isGameOver(board: Sudoku, correctnessArray: boolean[]): boolean {
    return !board.includes(null) && !correctnessArray.includes(false);
}

function markField(id: number, valid: boolean, correctnessArray: boolean[], setArray: Function) {
        const clone = [...correctnessArray];
        clone[id] = valid;
        if (clone[id] !== correctnessArray[id])
            setArray(clone);
}

const handleInput = (board: Sudoku, correctnessArray: boolean[], setCorrectnessArray: Function, 
                    setIsGameOver: Function, inputRefs: HTMLInputElement[]): ChangeEventHandler<HTMLInputElement> => {
  return (event: ChangeEvent<HTMLInputElement>)   => {
      const inputElement = event.target as HTMLInputElement;
      const inputId = +inputElement.id;

      if (/[^1-9]/.test(inputElement.value) || inputElement.value.length > 1) {
          inputElement.value = inputElement.value.slice(0, -1);
          return;
      }

     if (!inputElement.value) {
        board[inputId] = null;

        const clone = [...correctnessArray];
        clone[inputId] = true;
        
        board.forEach((n: number | null, index: number) => {
            if (!n || inputRefs[index].readOnly)
                return;
            clone[index] = doesNumberPass(index, n, board);
        });

        if (correctnessArray !== clone)
            setCorrectnessArray(clone);
        return;
     }

      const numberInserted = +inputElement.value;
      lastInsertedNumber = numberInserted;
      if (!doesNumberPass(inputId, numberInserted, board)) {
          board[inputId] = numberInserted;
          markField(inputId, false, correctnessArray, setCorrectnessArray);
          return;
      }
      board[inputId] = numberInserted;
      markField(inputId, true, correctnessArray, setCorrectnessArray);

 	    if (isGameOver(board, correctnessArray)) {
        setIsGameOver(true);
	    }
  };
};

const handleArrows = (inputsRef: MutableRefObject<HTMLInputElement[]>): KeyboardEventHandler<HTMLInputElement> => {
    return (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!event.target)
            return;
        const currentInputId = Number((event.target as HTMLInputElement).id);
        const numberOfInputs = numberOfElementsInRow * numberOfElementsInRow;
        let selectedInput: HTMLInputElement;

        switch (event.key) {
            case "ArrowDown":
                if (currentInputId + 9 < numberOfInputs)
                    selectedInput = inputsRef.current[currentInputId + 9];
                else
                    return;
                break;
            case "ArrowUp":
                if (currentInputId - 9 >= 0)
                    selectedInput = inputsRef.current[currentInputId - 9];
                else
                    return;
                break;
            case "ArrowLeft":
                if (currentInputId - 1 >= 0)
                    selectedInput = inputsRef.current[currentInputId - 1];
                else
                    return;
                break;
            case "ArrowRight":
                if (currentInputId + 1 < numberOfInputs)
                    selectedInput = inputsRef.current[currentInputId + 1];
                else
                    return;
                break;
            default:
                return;
        }
        selectedInput.setSelectionRange(selectedInput.value.length - 1, selectedInput.value.length - 1);
        selectedInput.focus();
    }
};


const getRandomNumber = (min: number, max: number): number => min == max? min : Math.floor(Math.random() * (max - min - 1) + min);
const getRowFromIndex = (index: number) => Math.floor(index / numberOfElementsInRow);
const getColumnFromIndex = (index: number) => index % numberOfElementsInRow;
const getSquareFromIndex = (index: number) =>
    Math.floor(getRowFromIndex(index) / squareDimension) * numberOfSquaresInRow +
    Math.floor(getColumnFromIndex(index) / squareDimension);

const isThereNumberInRow = (needle: number, haystack: Sudoku, row: number, excluding: number) => {
    const array = haystack.slice(row * numberOfElementsInRow, row * numberOfElementsInRow + numberOfElementsInRow);
    array.splice(excluding % numberOfElementsInRow, 1);
    return array.includes(needle);
}

const isThereNumberInColumn = (needle: number, haystack: Sudoku, column: number, excluding: number) => {
    const indexes: number[] = new Array(numberOfElementsInColumn).fill(null).map((_, i) => column + numberOfElementsInRow * i);
    indexes.splice(indexes.indexOf(excluding), 1);
    for(const index of indexes) {
        if (haystack[index] === needle)
            return true;
    }
    return false;
}

const isThereNumberInSquare = (needle: number, haystack: Sudoku, square: number, excluding: number) => {
    
    const indexes: number[] = [];
    for (let i = 0; i < numberOfSquaresInRow; i++) {
        for (let j = 0; j < numberOfSquaresInRow; j++) {
            indexes[i * numberOfSquaresInRow + j] = 
                Math.floor(square / numberOfSquaresInRow) * (squareDimension * numberOfElementsInRow) + 
                    (square % numberOfSquaresInRow) * squareDimension +
                    i * numberOfElementsInRow + j;
        }
    }
    indexes.splice(indexes.indexOf(excluding), 1);

    for(const index of indexes) {
        if (haystack[index] === needle)
            return true;
    }
    return false;
}

function doesNumberPass(index: number, insertedNumber: number, board: Sudoku): boolean {
    return !isThereNumberInRow(insertedNumber, board, getRowFromIndex(index), index) &&
           !isThereNumberInColumn(insertedNumber, board, getColumnFromIndex(index), index) &&
           !isThereNumberInSquare(insertedNumber, board, getSquareFromIndex(index), index);
}

const initBoard = (difficulty: Difficulty, inputsRef: MutableRefObject<HTMLInputElement[]>, exampleSolve: Sudoku, boardState: Sudoku) => {

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
      const numberToBeInserted = exampleSolve[randomIndex] ?? 0;

      inputsRef.current[randomIndex].value = numberToBeInserted.toString();
      inputsRef.current[randomIndex].readOnly = true;
      inputsRef.current[randomIndex].style.color = 'grey';

      boardState[randomIndex] = numberToBeInserted;
    }
};

interface FillCellInterface {
    index: number;
    cellArray: (number|null)[];
    availableNumbers: number[];
}

function fillCell({index, cellArray, availableNumbers}: FillCellInterface): boolean {
    availableNumbers = availableNumbers.filter(number => !cellArray.includes(number));
    const availableNumbersIndex = getRandomNumber(0, availableNumbers.length - 1);
    const chosenNumber = availableNumbers[availableNumbersIndex];

    cellArray[index] = chosenNumber;
    return true;
}

function generateExampleSudoku(sudokuArray: Sudoku) {

    const numbersArray: number[] = Array.from(Array(numberOfElementsInRow).keys()).map(number => number + 1);
    let sudoku2d: number[][] = Array(numberOfElementsInRow).fill(null).map(() => new Array(numberOfElementsInRow));

    for(let i = 0; i < numberOfElementsInRow; i++) {
        fillCell({
            index: i,
            cellArray: sudoku2d[0],
            availableNumbers: numbersArray
        });
    }

    for(let i = 1; i < numberOfRows; i++) {
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
  setHasGameStarted: Function;
  setHasGameEnded: Function;
}


export default function Board(props: BoardProps) {
  const inputsRef: MutableRefObject<HTMLInputElement[]> = useRef(new Array(numberOfElementsInRow * numberOfElementsInRow));
  const exampleSudoku: MutableRefObject<Sudoku> = useRef(new Array(numberOfElementsInRow ** 2).fill(null));
  const [isGameOver, setIsGameOver] = useState(false);
  const [correctnessArray, setCorrectnessArray] = useState<boolean[]>(new Array(numberOfElementsInRow * numberOfElementsInRow).fill(true));

  generateExampleSudoku(exampleSudoku.current);
  const board = useRef<Sudoku>(new Array(numberOfElementsInRow * numberOfElementsInColumn).fill(null));

  useEffect(() => {
      initBoard(props.difficulty, inputsRef, exampleSudoku.current, board.current);

      return () => {
        inputsRef.current.forEach(inputField => {
            inputField.value = '';
            inputField.removeAttribute('readonly');
            inputField.style.color = '';
        });
        board.current.fill(null);
      }
  }, [props.difficulty]);
    
  if (isGameOver) {
    props.setHasGameEnded(true);
    return (
        <>
            <h2 className={styles.h1}>Congratulations! You&apos;ve solved the sudoku puzzle</h2>
            <div>
                <Button text='Play again' color={Color.green} onClick={() => props.setHasGameStarted(false)}/>
            </div>
        </>
    );
  }
  let inputCounter = 0;

  const tdElements = [...Array(numberOfElementsInRow * numberOfElementsInRow)].map((_, i) =>
      <td key={i}>
        <input onChange={handleInput(board.current, correctnessArray, setCorrectnessArray, setIsGameOver, inputsRef.current)} onKeyDown={handleArrows(inputsRef)}
                         id={`${inputCounter++}`} ref={ (node) => {
          if (node) {
            inputsRef.current[Number(node.id)] = node;
          } else {
            delete inputsRef.current[inputCounter - 1];
          }
      }
      } style={{color: correctnessArray[inputCounter - 1]? 'black' : 'red'}}/>
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
