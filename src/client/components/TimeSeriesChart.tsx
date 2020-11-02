import React from "react";
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
import ChartExport from "./ChartExport";
import { formatValue } from "../format";
import TimeSeriesChartForExport from "./TimeSeriesChartForExport";
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
export default class TimeSeriesChart extends React.PureComponent<Props> {
  public getData = () => {
    return this.props.data.map((l, i) => ({
      time: i + 1,
      mean: l.reduce((a, b) => a + b, 0) / l.length,
      range: [l[0], l[l.length - 1]],
    }));
  };
  public render() {
    return (
      <>
        <ChartExport
          title={this.props.name}
          chart={
            <TimeSeriesChartForExport
              data={this.props.data}
              name={this.props.name}
              inputs={this.props.inputs}
            />
          }
        />
        <ResponsiveContainer width="99%" height={180}>
          <ComposedChart data={this.getData()} height={180}>
            <CartesianGrid strokeDasharray="2 2" />
            <Tooltip content={<CustomTooltip />} />
            <YAxis tickFormatter={x => formatValue(x)} />
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
            />
            <Area
              dataKey={"range"}
              fill={"#2d9cdb"}
              type="monotone"
              stroke="none"
              activeDot={false}
              fillOpacity={0.55}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </>
    );
  }
}
