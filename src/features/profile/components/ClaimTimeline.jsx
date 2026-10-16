export function ClaimTimeline({ steps }) {
  return (
    <ol className="claim-timeline">
      {steps.map((step, index) => (
        <li
          className={`claim-timeline-step step-${step.key.toLowerCase()}${step.complete ? ' is-complete' : ''}${index === steps.length - 1 ? ' is-last' : ''}`}
          key={step.key}
        >
          <span className="claim-timeline-marker" aria-hidden="true" />
          <div className="claim-timeline-copy">
            <strong>{step.label}</strong>
            <time>{step.time}</time>
          </div>
        </li>
      ))}
    </ol>
  );
}
