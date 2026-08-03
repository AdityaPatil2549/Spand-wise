import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

/**
 * Custom hook to animate a number from 0 to a target value.
 * Uses framer-motion for smooth, spring-based or tweened animation.
 * Returns the current animated value as a string (can be formatted).
 */
const defaultFormatter = (val: number) => Math.round(val).toLocaleString('en-IN');

export function useCountUp(
 targetValue: number,
 duration: number = 1.5,
 formatter: (value: number) => string = defaultFormatter
) {
 const [displayValue, setDisplayValue] = useState(formatter(0));

 useEffect(() => {
 if (targetValue === undefined || targetValue === null) return;

 const controls = animate(0, targetValue, {
 duration,
 ease: 'easeOut',
 onUpdate: (value) => {
 setDisplayValue(formatter(value));
 },
 });

 return () => controls.stop();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [targetValue, duration]); // Removed formatter from deps if we assume it's stable, or rely on the default

 return displayValue;
}
