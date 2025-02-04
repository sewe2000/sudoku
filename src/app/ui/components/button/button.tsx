import styles from '@/app/ui/components/button/button.module.css';
import {MouseEventHandler} from "react";

export enum Color {
    green = "green",
    blue = "blue",
    red = "red",
    white = "white"
}
interface PropsLayout {
    text: string;
    color?: Color;
    onClick?: MouseEventHandler<HTMLButtonElement>;
}
export default function Button(props: PropsLayout) {
    return <button className={`${styles.button} ${props.color? styles[props.color] : ''}`}
                   onClick={props.onClick}>{props.text}</button>
}
