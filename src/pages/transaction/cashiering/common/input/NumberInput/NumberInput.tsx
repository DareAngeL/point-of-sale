import "./NumberInput.css";

interface NumberInputProps {
  total: number;
}

export function NumberInput({total}: NumberInputProps) {
  const formattedTotal = `₱${total
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;

  return (
    <div className="number-input-container">
      <span className="number-input-text">
        <p>TOTAL:</p>
      </span>
      <input
        disabled
        type="text"
        className="button text-right px-2 py-2 pl-20 border-b-2 border-slate rounded-lg text-2xl w-[100%]"
        style={{letterSpacing: "4px"}}
        value={formattedTotal || 0}
      />
    </div>
  );
}
