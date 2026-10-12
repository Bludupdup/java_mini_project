/**
 * A labelled dropdown whose first option, "All", means "no filter".
 * choices: strings, or { value, label } when the two differ.
 */
function FilterSelect({ label, value, choices, onChange }) {
  return (
    <label className="filter-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">All</option>
        {choices.map((choice) => {
          const { value: optionValue, label: optionLabel } =
            typeof choice === "string" ? { value: choice, label: choice } : choice;

          return (
            <option value={optionValue} key={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </label>
  );
}

export default FilterSelect;
