'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Clock } from 'lucide-react';

interface AnimatedTimePickerProps {
 value: string; // "HH:mm" format (24h)
 onChange: (value: string) => void;
 label?: string;
 error?: string;
}

export const AnimatedTimePicker = ({ value, onChange, label, error }: AnimatedTimePickerProps) => {
 const [isOpen, setIsOpen] = useState(false);
 
 // Parse incoming value
 const parseTime = (timeStr: string) => {
 if (!timeStr) return { hour: 12, minute: 0, isAm: true };
 const [h, m] = timeStr.split(':').map(Number);
 const isAm = h < 12;
 const hour12 = h % 12 === 0 ? 12 : h % 12;
 return { hour: hour12, minute: m || 0, isAm };
 };

 const [current, setCurrent] = useState(() => parseTime(value));
 const [mode, setMode] = useState<'hour' | 'minute'>('hour');

 // Update internal state when value prop changes externally
 useEffect(() => {
 setCurrent(parseTime(value));
 }, [value]);

 const handleHourSelect = (h: number) => {
 setCurrent(prev => ({ ...prev, hour: h }));
 setMode('minute'); // Auto-advance to minutes
 };

 const handleMinuteSelect = (m: number) => {
 setCurrent(prev => ({ ...prev, minute: m }));
 };

 const toggleAmPm = (isAm: boolean) => {
 setCurrent(prev => ({ ...prev, isAm }));
 };

 const handleConfirm = () => {
 // Convert back to 24h format
 let h24 = current.hour;
 if (current.isAm && h24 === 12) h24 = 0;
 if (!current.isAm && h24 !== 12) h24 += 12;
 
 const hStr = h24.toString().padStart(2, '0');
 const mStr = current.minute.toString().padStart(2, '0');
 onChange(`${hStr}:${mStr}`);
 setIsOpen(false);
 };

 const displayHour = current.hour.toString().padStart(2, '0');
 const displayMinute = current.minute.toString().padStart(2, '0');
 const amPm = current.isAm ? 'AM' : 'PM';

 const formatDisplayTime = () => {
 if (!value) return '-- : --';
 const parsed = parseTime(value);
 return `${parsed.hour.toString().padStart(2, '0')}:${parsed.minute.toString().padStart(2, '0')} ${parsed.isAm ? 'AM' : 'PM'}`;
 };

 return (
 <>
 {/* Trigger Button */}
 <div className="flex flex-col w-full">
 {label && <label className="text-sm font-medium text-theme-secondary mb-1.5 block font-body">{label}</label>}
 <button
 type="button"
 onClick={() => {
 setCurrent(parseTime(value));
 setMode('hour');
 setIsOpen(true);
 }}
 className={`flex items-center justify-between w-full px-4 py-4 text-lg font-bold rounded-2xl border-2 transition-all duration-200
 ${error ? 'border-red-400 bg-red-50' : 'bg-theme-elevated border-transparent hover:border-theme-accent text-theme-primary'}`}
 >
 <span>{formatDisplayTime()}</span>
 <Clock className="w-5 h-5 text-theme-accent" />
 </button>
 {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
 </div>

 {/* Bottom Sheet Picker */}
 <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
 <div className="flex flex-col items-center py-2">
 
 {/* Big Time Display Header */}
 <div className="flex items-center justify-center gap-2 mb-8 bg-theme-elevated/50 p-6 rounded-3xl w-full">
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => setMode('hour')}
 className={`text-6xl font-black tabular-nums transition-colors ${mode === 'hour' ? 'text-theme-accent' : 'text-theme-tertiary hover:text-theme-primary'}`}
 >
 {displayHour}
 </button>
 <span className="text-5xl font-bold text-theme-tertiary pb-2">:</span>
 <button
 type="button"
 onClick={() => setMode('minute')}
 className={`text-6xl font-black tabular-nums transition-colors ${mode === 'minute' ? 'text-theme-accent' : 'text-theme-tertiary hover:text-theme-primary'}`}
 >
 {displayMinute}
 </button>
 </div>
 
 <div className="flex flex-col ml-4 gap-2">
 <button 
 type="button"
 onClick={() => toggleAmPm(true)}
 className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${current.isAm ? 'bg-theme-accent text-theme-inverse shadow-md' : 'bg-theme-border/50 text-theme-tertiary hover:bg-theme-border'}`}
 >
 AM
 </button>
 <button 
 type="button"
 onClick={() => toggleAmPm(false)}
 className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${!current.isAm ? 'bg-theme-accent text-theme-inverse shadow-md' : 'bg-theme-border/50 text-theme-tertiary hover:bg-theme-border'}`}
 >
 PM
 </button>
 </div>
 </div>

 {/* Grid Selection */}
 <div className="w-full relative h-[240px] overflow-hidden">
 <AnimatePresence mode="wait">
 {mode === 'hour' ? (
 <motion.div
 key="hours"
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 transition={{ duration: 0.2 }}
 className="grid grid-cols-4 gap-3 w-full absolute inset-0"
 >
 {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
 <button
 type="button"
 key={`h-${h}`}
 onClick={() => handleHourSelect(h)}
 className={`h-14 rounded-2xl text-xl font-bold transition-all duration-200
 ${current.hour === h 
 ? 'bg-theme-accent text-theme-inverse shadow-md scale-105' 
 : 'bg-theme-elevated text-theme-primary hover:bg-theme-border'}`}
 >
 {h}
 </button>
 ))}
 </motion.div>
 ) : (
 <motion.div
 key="minutes"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 transition={{ duration: 0.2 }}
 className="w-full absolute inset-0 flex flex-col"
 >
 <div className="grid grid-cols-4 gap-3">
 {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
 <button
 type="button"
 key={`m-${m}`}
 onClick={() => handleMinuteSelect(m)}
 className={`h-12 rounded-2xl text-xl font-bold transition-all duration-200
 ${current.minute === m 
 ? 'bg-theme-accent text-theme-inverse shadow-md scale-105' 
 : 'bg-theme-elevated text-theme-primary hover:bg-theme-border'}`}
 >
 {m.toString().padStart(2, '0')}
 </button>
 ))}
 </div>
 {/* Fine-tune minute slider */}
 <div className="mt-6 px-2">
 <div className="flex justify-between text-xs font-medium text-theme-tertiary mb-2 uppercase tracking-wider">
 <span>Fine Tune</span>
 <span>{displayMinute}</span>
 </div>
 <input 
 type="range" 
 min="0" 
 max="59" 
 value={current.minute}
 onChange={(e) => handleMinuteSelect(Number(e.target.value))}
 className="w-full h-2 bg-theme-border rounded-full appearance-none cursor-pointer accent-theme-accent"
 />
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 <div className="w-full mt-6">
 <button
 type="button"
 onClick={handleConfirm}
 className="w-full py-4 bg-theme-accent text-theme-inverse font-bold text-lg rounded-2xl hover:bg-theme-accent-hover transition-colors shadow-lg active:scale-[0.98]"
 >
 Confirm Time
 </button>
 </div>

 </div>
 </BottomSheet>
 </>
 );
};
