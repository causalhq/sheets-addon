export interface SimulationResult {
  inputs: number[][];
  // [iteration][output_index][range_y][range_x]
  outputs: number[][][][];
}
export type Simulation =
  | { type: "empty" }
  | { type: "error"; error: string }
  | { type: "loading"; lastValue?: SimulationResult }
  | { type: "value"; value: SimulationResult };

export function getSimulationResult(
  s: Simulation
): SimulationResult | undefined {
  if (s.type === "value") return s.value;
  if (s.type === "loading") return s.lastValue;
  return undefined;
}
export function combineSimulationResults(
  r: SimulationResult,
  rNew?: SimulationResult
): SimulationResult {
  if (rNew === undefined) return r;
  return {
    inputs: r.inputs.concat(rNew.inputs),
    outputs: r.outputs.concat(rNew.outputs),
  };
}
