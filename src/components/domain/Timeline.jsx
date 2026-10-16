import { formatDate } from '../../lib/format.js';

export function Timeline({ events }) {
  return (
    <ol className="timeline">
      {events.map((event) => (
        <li key={event.id} className="timeline-event">
          <strong>{event.title}</strong>
          <time dateTime={event.at}>
            {formatDate(event.at, 'd MMM yyyy, HH:mm')}
          </time>
          {event.description && <p>{event.description}</p>}
        </li>
      ))}
    </ol>
  );
}
