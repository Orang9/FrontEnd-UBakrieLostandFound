export function ReportCategoryField({ category, categories, error, register }) {
  return (
    <label className="report-field" htmlFor="item-category">
      <span>Kategori barang</span>
      <select
        id="item-category"
        value={category ?? ''}
        aria-invalid={Boolean(error)}
        {...register('category', {
          required: 'Pilih kategori barang.',
        })}
      >
        <option value="">Pilih kategori</option>
        {categories.map((option) => (
          <option key={option.category_id} value={option.category_id}>
            {option.name}
          </option>
        ))}
      </select>
      {error && <span className="report-error">{error.message}</span>}
    </label>
  );
}
