export function ChallengeQuestions({ questions, answers, onAnswerChange }) {
  return (
    <div className="challenge-questions">
      {questions.map((question, index) => (
        <label
          className="form-field"
          key={question.id}
          htmlFor={`claim-answer-${question.id}`}
        >
          {question.prompt}
          <textarea
            id={`claim-answer-${question.id}`}
            className="text-input"
            value={answers[index] ?? ''}
            onChange={(event) => onAnswerChange(index, event.target.value)}
            rows={3}
            required
          />
        </label>
      ))}
    </div>
  );
}
