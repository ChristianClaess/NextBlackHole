"use client";

type Props = {
  resolutionScale: number;
  setResolutionScale: (v: number) => void;
};

export default function Controls({
  resolutionScale,
  setResolutionScale,
}: Props) {
  return (
    <div
      style={{
        padding: 16,
        background: "#121525",
        borderRadius: 16,
      }}
    >
      <h3>Render</h3>

      <div>
        <label>
          Resolution: {resolutionScale.toFixed(2)}
        </label>
        <input
          type="range"
          min="0.25"
          max="2"
          step="0.05"
          value={resolutionScale}
          onChange={(e) => setResolutionScale(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
