type DateInput = string | Date | number;

export const formatDate = (dateInput: DateInput, options: Intl.DateTimeFormatOptions = {}): string => {
  const date = new Date(dateInput);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };

  return date.toLocaleDateString('ru-RU', { ...defaultOptions, ...options });
};

export const formatTime = (dateInput: DateInput, options: Intl.DateTimeFormatOptions = {}): string => {
  const date = new Date(dateInput);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit'
  };

  return date.toLocaleTimeString('ru-RU', { ...defaultOptions, ...options });
};

export const formatDateTime = (dateInput: DateInput): string => {
  const date = new Date(dateInput);
  return `${formatDate(date)} в ${formatTime(date)}`;
};

export const getRelativeTime = (dateInput: DateInput): string => {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInHours < 1) {
    return 'только что';
  } else if (diffInHours < 24) {
    return `${diffInHours} ${getRussianNoun(diffInHours, ['час', 'часа', 'часов'])} назад`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ${getRussianNoun(diffInDays, ['день', 'дня', 'дней'])} назад`;
  } else {
    return formatDate(date);
  }
};

const getRussianNoun = (number: number, words: [string, string, string]): string => {
  const cases = [2, 0, 1, 1, 1, 2];
  return words[
    number % 100 > 4 && number % 100 < 20 ? 2 : cases[Math.min(number % 10, 5)]
  ];
};

export const isValidDate = (dateInput: DateInput): boolean => {
  const date = new Date(dateInput);
  return !isNaN(date.getTime());
};

export const formatToDDMMYYYY = (dateInput: DateInput): string => {
  const date = new Date(dateInput);
  
  if (!isValidDate(date)) {
    return 'Неверная дата';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

export const formatToDDMMYYYYHHMM = (dateInput: DateInput): string => {
  const date = new Date(dateInput);
  
  if (!isValidDate(date)) {
    return 'Неверная дата';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

export const parseFromDDMMYYYY = (dateString: string): Date | null => {
  const parts = dateString.split('.');
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month, day);
  
  return isValidDate(date) ? date : null;
};