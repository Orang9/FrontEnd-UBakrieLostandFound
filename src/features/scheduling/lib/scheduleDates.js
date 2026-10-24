const weekdayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function getJakartaDate(now) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

export function getScheduleDates(now = new Date()) {
  const jakartaToday = getJakartaDate(now);
  const todayUtc = new Date(`${jakartaToday}T00:00:00Z`);
  const weekday = todayUtc.getUTCDay();
  const daysUntilNextMonday = (8 - weekday) % 7 || 7;
  const startOffset = weekday >= 5 || weekday === 0 ? daysUntilNextMonday : 1;
  const startDate = new Date(todayUtc);
  startDate.setUTCDate(startDate.getUTCDate() + startOffset);
  const fridayOffset = 5 - startDate.getUTCDay();
  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + fridayOffset);

  const dates = [];
  for (
    const date = new Date(startDate);
    date <= endDate;
    date.setUTCDate(date.getUTCDate() + 1)
  ) {
    const dateId = date.toISOString().slice(0, 10);
    dates.push({
      id: dateId,
      date: dateId,
      day: weekdayNames[date.getUTCDay()],
      weekday: new Intl.DateTimeFormat('id-ID', {
        weekday: 'short',
        timeZone: 'UTC',
      }).format(date),
      full: new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(date),
    });
  }

  return dates;
}
