import React, { Fragment } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatValue } from "../format";
import { Input } from "../State";

const CustomTooltip = ({ active, payload, label }: any) => {
  const range = payload.find(x => x.name === "range");
  const mean = payload.find(x => x.name === "mean");
  if (active) {
    return (
      <div className="chartTooltip">
        <div className="keyValues">
          <div className="key">Mean:</div>
          <div className="value">{formatValue(mean.value)}</div>
          <div className="key">Range:</div>
          <div className="value">{`${formatValue(
            range.value[0]
          )} – ${formatValue(range.value[1])}`}</div>
        </div>
      </div>
    );
  }

  return null;
};

interface Props {
  data: number[][]; // assume it's sorted
  name: string;
  inputs: Input[];
}
export default class TimeSeriesChartForExport extends React.PureComponent<
  Props
> {
  public getData = () => {
    return this.props.data.map((l, i) => ({
      time: i + 1,
      mean: l.reduce((a, b) => a + b, 0) / l.length,
      range: [l[0], l[l.length - 1]],
    }));
  };
  public render() {
    return (
      <div className="chart-export-wrapper">
        <div className="chart-title">{this.props.name}</div>
        <div className="chart-subtitle">
          Inputs:{" "}
          {this.props.inputs.map((input, i) => (
            <Fragment key={i}>
              <strong>{input.cell}</strong> ({input.expression})
              {i === this.props.inputs.length - 1 ? "" : ", "}
            </Fragment>
          ))}
        </div>
        <ResponsiveContainer width="99%" height={180}>
          <ComposedChart data={this.getData()} height={180}>
            <CartesianGrid strokeDasharray="2 2" />
            <Tooltip content={<CustomTooltip />} />
            <YAxis tickFormatter={x => formatValue(x)} width={50} />
            <XAxis
              dataKey="time"
              type="number"
              domain={["dataMin", "dataMax"]}
              allowDecimals={false}
            />
            <Line
              dataKey={"mean"}
              stroke={"#2d9cdb"}
              type="monotone"
              dot={false}
              strokeWidth={1.75}
              isAnimationActive={false}
            />
            <Area
              dataKey={"range"}
              fill={"#2d9cdb"}
              type="monotone"
              stroke="none"
              activeDot={false}
              fillOpacity={0.55}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="chart-explanation">
          Shaded area shows 90% uncertainty interval
        </div>
      </div>
    );
  }
}
