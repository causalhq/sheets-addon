import server from "./server";

export interface Input {
  cell: string;
  sheetId: number;
  expression: string;
}
export interface Output {
  range: string;
  sheetId: number;
  name: string;
}
export interface State {
  inputs: Input[];
  outputs: Output[];
}
export const emptyState: State = {
  inputs: [],
  outputs: [],
};

const PROPERTY_CAUSAL_STATE = "PROPERTY_CAUSAL_STATE";
export async function writeState(state: State): Promise<void> {
  console.log("write state", state);
  const serializedState = JSON.stringify(state);
  return server.setDocumentProperty(PROPERTY_CAUSAL_STATE, serializedState);
}
export async function readState(): Promise<State> {
  const state = await server.getDocumentProperty(PROPERTY_CAUSAL_STATE);
  if (state === null || state === "") return emptyState;
  try {
    const parsed = JSON.parse(state);
    console.log("read state", parsed);
    return parsed;
  } catch (e) {
    console.log("state parsing error", e);
  }
  return emptyState;
}
