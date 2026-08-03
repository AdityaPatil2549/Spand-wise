import { useEffect } from 'react';

export function usePreventScroll({ isDisabled }: { isDisabled: boolean }) {
 useEffect(() => {
 if (!isDisabled) {
 document.body.style.overflow = 'hidden';
 } else {
 document.body.style.overflow = '';
 }

 return () => {
 document.body.style.overflow = '';
 };
 }, [isDisabled]);
}
