import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from './config';

export default getRequestConfig(async ({ locale, requestLocale }) => {
  // Validate that the incoming `locale` parameter is valid
  // 1. When called with explicit locale (e.g., getMessages({ locale })), use it directly
  // 2. When called without locale (e.g., getFormats(), getTimeZone()), fallback to requestLocale from headers
  const resolvedLocale = locale ?? (await requestLocale);
  if (!locales.includes(resolvedLocale as any)) notFound();

  return {
    locale: resolvedLocale as string,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default
  };
});