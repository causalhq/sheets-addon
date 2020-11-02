import React from "react";
import { Output, Input } from "../State";
import TimeSeriesChart from "./TimeSeriesChart";

interface Props {
  inputs: Input[];
  output: Output;
  // [iteration][range_x][range_y]
  results: number[][][];
}
export default function RangeResult({ output, results, inputs }: Props) {
  if (results.length === 0) return null;
  const oneResult = results[0];
  const numTimeSteps =
    oneResult.length === 1 ? oneResult[0].length : oneResult.length;
  const data: number[][] = new Array(numTimeSteps).fill(0).map(_ => []); // [time_step][iteration]
  results.forEach(result => {
    if (result.length === 1) {
      result[0].forEach((value, timeStep) => {
        data[timeStep].push(value);
      });
    } else {
      result.forEach((l, timeStep) => {
        data[timeStep].push(l[0]);
      });
    }
  });
  data.forEach(row => row.sort((a, b) => a - b));

  return <TimeSeriesChart data={data} name={output.name} inputs={inputs} />;
}
