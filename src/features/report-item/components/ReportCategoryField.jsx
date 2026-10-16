export function ReportCategoryField({
  category,
  error,
  isSensitive,
  register,
}) {
  return (
    <fieldset className="report-field report-category-field">
      <legend>Kategori</legend>
      <div className="report-category-options">
        <label
          className={`report-category-option${category === 'general' ? ' is-selected' : ''}`}
        >
          <input
            type="radio"
            value="general"
            aria-label="Umum"
            {...register('category', {
              required: 'Pilih kategori barang.',
            })}
          />
          <span>Umum</span>
        </label>
        <label
          className={`report-category-option${isSensitive ? ' is-selected is-sensitive' : ''}`}
        >
          <input
            type="radio"
            value="sensitive"
            aria-label="Sensitif"
            {...register('category', {
              required: 'Pilih kategori barang.',
            })}
          />
          <span>Sensitif</span>
        </label>
      </div>
      {error && <span className="report-error">{error.message}</span>}
    </fieldset>
  );
}
