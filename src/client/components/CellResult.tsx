import React from "react";
import { Output } from "../State";
import { Container } from "@material-ui/core";
import { formatValue } from "../format";

interface Props {
  output: Output;
  values: number[];
}
export default function CellResult(props: Props) {
  props.values.sort((a, b) => a - b);
  const mean = props.values.reduce((a, b) => a + b, 0) / props.values.length;
  return (
    <Container>
      <div className="keyValues">
        <div className="key">Mean:</div>
        <div className="value">{formatValue(mean)}</div>
        <div className="key">Range:</div>
        <div className="value">
          {formatValue(props.values[0])} –{" "}
          {formatValue(props.values[props.values.length - 1])}
        </div>
      </div>
    </Container>
  );
}
