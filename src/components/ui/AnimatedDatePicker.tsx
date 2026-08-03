'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
 format, 
 addMonths, 
 subMonths, 
 startOfMonth, 
 endOfMonth, 
 startOfWeek, 
 endOfWeek, 
 eachDayOfInterval,
 isSameMonth,
 isSameDay,
 isToday,
 parseISO
} from 'date-fns';

interface AnimatedDatePickerProps {
 value: string; // "YYYY-MM-DD" format
 onChange: (value: string) => void;
 label?: string;
 error?: string;
}

export const AnimatedDatePicker = ({ value, onChange, label, error }: AnimatedDatePickerProps) => {
 const [isOpen, setIsOpen] = useState(false);
 
 // The currently selected full date
 const [selectedDate, setSelectedDate] = useState(() => value ? parseISO(value) : new Date());
 
 // The month currently being viewed in the calendar
 const [viewDate, setViewDate] = useState(() => value ? parseISO(value) : new Date());
 
 // Direction for animation (1 for right, -1 for left)
 const [direction, setDirection] = useState(0);

 // Sync internal state with external value
 useEffect(() => {
 if (value) {
 const newDate = parseISO(value);
 setSelectedDate(newDate);
 setViewDate(newDate);
 }
 }, [value]);

 const handlePrevMonth = () => {
 setDirection(-1);
 setViewDate(prev => subMonths(prev, 1));
 };

 const handleNextMonth = () => {
 setDirection(1);
 setViewDate(prev => addMonths(prev, 1));
 };

 const handleDateSelect = (day: Date) => {
 setSelectedDate(day);
 };

 const handleConfirm = () => {
 onChange(format(selectedDate, 'yyyy-MM-dd'));
 setIsOpen(false);
 };

 // Calendar math
 const monthStart = startOfMonth(viewDate);
 const monthEnd = endOfMonth(monthStart);
 const startDate = startOfWeek(monthStart);
 const endDate = endOfWeek(monthEnd);
 
 const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

 const formatDisplayDate = () => {
 if (!value) return '-- / -- / ----';
 return format(parseISO(value), 'MMM d, yyyy');
 };

 const variants = {
 enter: (direction: number) => ({
 x: direction > 0 ? 50 : -50,
 opacity: 0
 }),
 center: {
 x: 0,
 opacity: 1
 },
 exit: (direction: number) => ({
 x: direction > 0 ? -50 : 50,
 opacity: 0
 })
 };

 return (
 <>
 {/* Trigger Button */}
 <div className="flex flex-col w-full">
 {label && <label className="text-sm font-medium text-theme-secondary mb-1.5 block font-body">{label}</label>}
 <button
 type="button"
 onClick={() => {
 const initial = value ? parseISO(value) : new Date();
 setSelectedDate(initial);
 setViewDate(initial);
 setIsOpen(true);
 }}
 className={`flex items-center justify-between w-full px-4 py-4 text-lg font-bold rounded-2xl border-2 transition-all duration-200
 ${error ? 'border-red-400 bg-red-50' : 'bg-theme-elevated border-transparent hover:border-theme-accent text-theme-primary'}`}
 >
 <span>{formatDisplayDate()}</span>
 <CalendarIcon className="w-5 h-5 text-theme-accent" />
 </button>
 {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
 </div>

 {/* Bottom Sheet Picker */}
 <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
 <div className="flex flex-col items-center py-2">
 
 {/* Calendar Header */}
 <div className="flex items-center justify-between w-full mb-6 px-2">
 <button
 onClick={handlePrevMonth}
 className="p-3 rounded-full hover:bg-theme-elevated transition-colors text-theme-secondary"
 >
 <ChevronLeft className="w-6 h-6" />
 </button>
 <h3 className="text-xl font-bold text-theme-primary font-headline w-40 text-center">
 {format(viewDate, 'MMMM yyyy')}
 </h3>
 <button
 onClick={handleNextMonth}
 className="p-3 rounded-full hover:bg-theme-elevated transition-colors text-theme-secondary"
 >
 <ChevronRight className="w-6 h-6" />
 </button>
 </div>

 {/* Days of Week */}
 <div className="grid grid-cols-7 w-full mb-2">
 {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
 <div key={day} className="text-center text-xs font-bold text-theme-tertiary uppercase tracking-wider">
 {day}
 </div>
 ))}
 </div>

 {/* Calendar Grid (Animated) */}
 <div className="w-full relative h-[310px] overflow-hidden">
 <AnimatePresence initial={false} custom={direction} mode="popLayout">
 <motion.div
 key={viewDate.toISOString()}
 custom={direction}
 variants={variants}
 initial="enter"
 animate="center"
 exit="exit"
 transition={{ type: "spring", stiffness: 300, damping: 30 }}
 className="grid grid-cols-7 gap-y-2 gap-x-1 absolute w-full"
 >
 {calendarDays.map((day, i) => {
 const isSelected = isSameDay(day, selectedDate);
 const isCurrentMonth = isSameMonth(day, viewDate);
 const isTodayDate = isToday(day);

 return (
 <div key={i} className="flex items-center justify-center h-10">
 <button
 onClick={() => handleDateSelect(day)}
 className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200
 ${isSelected 
 ? 'bg-theme-accent text-theme-inverse shadow-md scale-110' 
 : isTodayDate
 ? 'bg-theme-elevated text-theme-accent border border-theme-accent/30'
 : isCurrentMonth
 ? 'text-theme-primary hover:bg-theme-elevated'
 : 'text-theme-border hover:bg-theme-elevated/50'
 }`}
 >
 {format(day, 'd')}
 </button>
 </div>
 );
 })}
 </motion.div>
 </AnimatePresence>
 </div>

 <div className="w-full mt-2">
 <button
 onClick={handleConfirm}
 className="w-full py-4 bg-theme-accent text-theme-inverse font-bold text-lg rounded-2xl hover:bg-theme-accent-hover transition-colors shadow-lg active:scale-[0.98]"
 >
 Confirm Date
 </button>
 </div>

 </div>
 </BottomSheet>
 </>
 );
};
