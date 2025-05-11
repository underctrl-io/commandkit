import dayjs from 'dayjs';

const DEFAULT_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export function formatDate(
  date: Date | number | string,
  format = DEFAULT_FORMAT,
) {
  return dayjs(date).format(format);
}
