import { format, addDays, addWeeks, addMonths, isAfter, isSameDay } from 'date-fns';

/**
 * Format a date as a readable string
 * @param {Date|string} date - The date to format
 * @param {string} formatString - Format pattern to use
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatString = 'MMM d, yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString);
};

/**
 * Calculate the next occurrence of a recurring task
 * @param {Object} recurrence - The recurrence configuration
 * @param {Date|string} baseDate - The base date to calculate from
 * @returns {Date} The next occurrence date
 */
export const getNextOccurrence = (recurrence, baseDate) => {
  if (!recurrence || !recurrence.frequency) return null;
  
  const baseDateObj = typeof baseDate === 'string' ? new Date(baseDate) : baseDate;
  const today = new Date();
  let nextDate;
  
  switch (recurrence.frequency) {
    case 'daily':
      nextDate = getNextDailyOccurrence(baseDateObj, recurrence.interval || 1);
      break;
    case 'weekly':
      nextDate = getNextWeeklyOccurrence(baseDateObj, recurrence.weekdays, recurrence.interval || 1);
      break;
    case 'monthly':
      nextDate = getNextMonthlyOccurrence(baseDateObj, recurrence.monthlyOption, recurrence.monthlyDay, recurrence.interval || 1);
      break;
    case 'custom':
      nextDate = addDays(baseDateObj, recurrence.interval || 1);
      break;
    default:
      return null;
  }
  
  // If next date is in the past, calculate again from today
  if (nextDate && !isAfter(nextDate, today) && !isSameDay(nextDate, today)) {
    return getNextOccurrence(recurrence, today);
  }
  
  return nextDate;
};

/**
 * Calculate the next daily occurrence
 * @param {Date} baseDate - The base date
 * @param {number} interval - Number of days between occurrences
 * @returns {Date} The next occurrence date
 */
const getNextDailyOccurrence = (baseDate, interval) => {
  return addDays(baseDate, interval);
};

/**
 * Calculate the next weekly occurrence
 * @param {Date} baseDate - The base date
 * @param {Array} weekdays - Array of weekdays (0-6, where 0 is Sunday)
 * @param {number} interval - Number of weeks between occurrences
 * @returns {Date} The next occurrence date
 */
const getNextWeeklyOccurrence = (baseDate, weekdays, interval) => {
  if (!weekdays || !weekdays.length) {
    // Default to the same day of week as the base date
    return addWeeks(baseDate, interval);
  }
  
  const today = new Date();
  const todayDay = today.getDay();
  
  // Sort weekdays to find the next one after today
  const sortedDays = [...weekdays].sort((a, b) => a - b);
  
  // Find the next day of week
  const nextDayIndex = sortedDays.findIndex(day => day > todayDay);
  
  if (nextDayIndex !== -1) {
    // Found a day later this week
    const daysToAdd = sortedDays[nextDayIndex] - todayDay;
    return addDays(today, daysToAdd);
  } else if (sortedDays.length > 0) {
    // Take the first day next week
    const daysToAdd = 7 - todayDay + sortedDays[0];
    return addDays(today, daysToAdd + (interval - 1) * 7);
  }
  
  return addWeeks(baseDate, interval);
};

/**
 * Calculate the next monthly occurrence
 * @param {Date} baseDate - The base date
 * @param {string} option - 'dayOfMonth' or 'dayOfWeek'
 * @param {number|Object} dayValue - Day number or {day, week} object
 * @param {number} interval - Number of months between occurrences
 * @returns {Date} The next occurrence date
 */
const getNextMonthlyOccurrence = (baseDate, option, dayValue, interval) => {
  const nextDate = addMonths(baseDate, interval);
  
  if (option === 'dayOfMonth' && typeof dayValue === 'number') {
    // Keep same day of month
    const currentDay = baseDate.getDate();
    nextDate.setDate(Math.min(currentDay, getDaysInMonth(nextDate.getMonth(), nextDate.getFullYear())));
  }
  
  return nextDate;
};

// Helper to get days in a month
const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};