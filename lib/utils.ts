/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-prototype-builtins */
import qs from 'query-string';
import { isValid, parseISO } from 'date-fns';
import { isValidStateAbbreviation } from 'usa-state-validator';
import { logger } from './logger';
import { postcodeValidator } from 'postcode-validator';
import { twMerge } from 'tailwind-merge';
import { type ClassValue, clsx } from 'clsx';
import { z } from 'zod';

const log = logger.child({ lib: 'utils' });

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// FORMAT DATE TIME
export const formatDateTime = (dateString: Date) => {
  log.debug('formatDateTime', { dateString });

  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
    month: 'short', // abbreviated month name (e.g., 'Oct')
    day: 'numeric', // numeric day of the month (e.g., '25')
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const dateDayOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
    year: 'numeric', // numeric year (e.g., '2023')
    month: '2-digit', // abbreviated month name (e.g., 'Oct')
    day: '2-digit', // numeric day of the month (e.g., '25')
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // numeric year (e.g., '2023')
    day: 'numeric', // numeric day of the month (e.g., '25')
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString(
    'en-US',
    dateTimeOptions,
  );

  const formattedDateDay: string = new Date(dateString).toLocaleString(
    'en-US',
    dateDayOptions,
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
    'en-US',
    dateOptions,
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
    'en-US',
    timeOptions,
  );

  return {
    dateTime: formattedDateTime,
    dateDay: formattedDateDay,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

export function formatAmount(amount: number): string {
  log.debug('formatAmount', { amount });

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
}

export const formatCategory = (str: string) => {
  log.debug('formatCategory', { str });

  // words to keep lowercase in title‐case (unless first word)
  const minorWords = new Set([
    'a',
    'an',
    'and',
    'as',
    'at',
    'but',
    'by',
    'for',
    'from',
    'in',
    'nor',
    'of',
    'on',
    'or',
    'per',
    'the',
    'to',
    'vs',
    'via',
  ]);

  // split on underscores, lowercase everything
  const parts = str.toLowerCase().split('_');

  return parts
    .map((word, i) => {
      if (i > 0 && minorWords.has(word)) {
        // keep minor words lowercase (if not first word)
        return word;
      }
      // otherwise capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

export const parseStringify = (value: any) => JSON.parse(JSON.stringify(value));

export const removeSpecialCharacters = (value: string) => {
  log.debug('removeSpecialCharacters', { value });

  return value.replace(/[^\w\s]/gi, '');
};

interface UrlQueryParams {
  params: string;
  key: string;
  value: string;
}

export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  log.debug('formUrlQuery', { params, key, value });
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true },
  );
}

export function getAccountTypeColors(type: AccountTypes) {
  log.debug('getAccountTypeColors', { type });

  switch (type) {
    case 'depository':
      return {
        bg: 'bg-blue-25',
        lightBg: 'bg-blue-100',
        title: 'text-blue-900',
        subText: 'text-blue-700',
      };

    case 'credit':
      return {
        bg: 'bg-success-25',
        lightBg: 'bg-success-100',
        title: 'text-success-900',
        subText: 'text-success-700',
      };

    default:
      return {
        bg: 'bg-green-25',
        lightBg: 'bg-green-100',
        title: 'text-green-900',
        subText: 'text-green-700',
      };
  }
}

export function countTransactionCategories(
  transactions: Transaction[],
): CategoryCount[] {
  log.debug('countTransactionCategories');
  const categoryCounts: { [category: string]: number } = {};
  let totalCount = 0;

  // Iterate over each transaction
  transactions &&
    transactions.forEach((transaction) => {
      // Extract the category from the transaction
      const category = transaction.category;

      // If the category exists in the categoryCounts object, increment its count
      if (categoryCounts.hasOwnProperty(category)) {
        categoryCounts[category]++;
      } else {
        // Otherwise, initialize the count to 1
        categoryCounts[category] = 1;
      }

      // Increment total count
      totalCount++;
    });

  // Convert the categoryCounts object to an array of objects
  const aggregatedCategories: CategoryCount[] = Object.keys(categoryCounts).map(
    (category) => ({
      name: formatCategory(category),
      count: categoryCounts[category],
      totalCount,
    }),
  );

  // Sort the aggregatedCategories array by count in descending order
  aggregatedCategories.sort((a, b) => b.count - a.count);

  return aggregatedCategories;
}

export function extractCustomerIdFromUrl(url: string) {
  log.debug('extractCustomerIdFromUrl', { url });
  // Split the URL string by '/'
  const parts = url.split('/');

  // Extract the last part, which represents the customer ID
  const customerId = parts[parts.length - 1];

  return customerId;
}

export function encryptId(id: string) {
  log.debug('encryptId', { id });
  return btoa(id);
}

export function decryptId(id: string) {
  log.debug('decryptId', { id });
  return atob(id);
}

export const authFormSchema = (type: string) =>
  z.object({
    // sign up fields
    firstName:
      type === 'sign-in'
        ? z.string().optional()
        : z.string().min(2, 'First name must be at least 2 characters'),
    lastName:
      type === 'sign-in'
        ? z.string().optional()
        : z.string().min(2, 'Last name must be at least 2 characters'),
    address1:
      type === 'sign-in'
        ? z.string().optional()
        : z.string().max(50, 'Address too long'),
    city:
      type === 'sign-in'
        ? z.string().optional()
        : z.string().max(50, 'City name too long'),
    state:
      type === 'sign-in'
        ? z.string().optional()
        : z
            .string()
            .length(2, 'State must be 2 letters')
            .refine(
              (val) => isValidStateAbbreviation(val),
              'Invalid U.S. state code',
            ),
    postalCode:
      type === 'sign-in'
        ? z.string().optional()
        : z
            .string()
            .refine(
              (val) => postcodeValidator(val, 'US'),
              'Invalid U.S. ZIP code',
            ),
    dateOfBirth:
      type === 'sign-in'
        ? z.string().optional()
        : z
            .string()
            .regex(
              /^\d{4}-\d{2}-\d{2}$/,
              'Date of Birth must be in YYYY-MM-DD format',
            )
            .refine((str) => {
              const dob = parseISO(str);
              return isValid(dob);
            }, 'Date of Birth is not a valid date'),
    ssn:
      type === 'sign-in'
        ? z.string().optional()
        : z.string().regex(/^\d{9}$/, 'SSN must be exactly 9 digits'),

    // fields for both
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  });
