import { Roboto } from 'next/font/google';

export const roboto = Roboto({
    subsets: ["latin"],
    preload: true,
    weight: ["500", "700"],
    style: ["normal"]
});