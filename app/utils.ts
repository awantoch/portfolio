import { DATE_CONFIG } from './constants'

export const cx = (...classes: (string | undefined | null | false)[]) => 
  classes.filter(Boolean).join(' ');

export const formatDate = (date: string | Date, includeRelative = false) => {
  const currentDate = new Date();
  const targetDate = new Date(date);
  
  if (includeRelative) {
    const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
    const monthsAgo = currentDate.getMonth() - targetDate.getMonth();
    const daysAgo = currentDate.getDate() - targetDate.getDate();

    let relativeDate = '';
    if (yearsAgo > 0) {
      relativeDate = `${yearsAgo}y ago`;
    } else if (monthsAgo > 0) {
      relativeDate = `${monthsAgo}mo ago`;
    } else if (daysAgo > 0) {
      relativeDate = `${daysAgo}d ago`;
    } else {
      relativeDate = 'Today';
    }

    const fullDate = targetDate.toLocaleDateString(DATE_CONFIG.dateLocale, DATE_CONFIG.dateFormat);

    return `${fullDate} (${relativeDate})`;
  }

  return targetDate.toLocaleDateString(DATE_CONFIG.dateLocale, DATE_CONFIG.dateFormat);
};

export const truncateText = (text: string, length: number) => {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}; 