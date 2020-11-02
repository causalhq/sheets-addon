import FileSaver from "file-saver";
import ReactDOM from "react-dom";
import html2canvas from "html2canvas";
import React from "react";
import { Button } from "@material-ui/core";

const OPTIMAL_CHART_HEIGHT_PX = 720;

function isClipboardAPI(): boolean {
  return (
    navigator.clipboard !== undefined &&
    "write" in navigator.clipboard &&
    "ClipboardItem" in window
  );
}

interface Props {
  chart: JSX.Element;
  title: string;
}

export default class ChartExport extends React.PureComponent<Props> {
  public getCanvasFromChart = async () => {
    // fix shifting bug
    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.top = "-9999px";
    div.style.left = "-9999px";
    div.style.overflow = "hidden";
    div.style.width = OPTIMAL_CHART_HEIGHT_PX + "px";
    // div.style.transform = `scale(${OPTIMAL_CHART_HEIGHT_PX /
    //   node.offsetHeight})`;

    // div.innerHTML = node.outerHTML;

    document.body.appendChild(div);
    await new Promise(resolve =>
      ReactDOM.render(this.props.chart, div, resolve)
    );
    // await new Promise(resolve => setTimeout(resolve, 1000));
    const svg = div.querySelector("svg.recharts-surface");
    if (svg !== null) {
      console.log("found SVG");
      // set needed font style for canvas
      svg.setAttribute(
        "style",
        "font-family: Inter, sans-serif; font-size: 13px;" +
          "transform: translateY(10px);"
      );
    }

    const canvas = await html2canvas(div, {
      scrollY: 0,
    });

    document.body.removeChild(div);

    return canvas;
  };

  public exportChartAsPNG = async () => {
    const canvas = await this.getCanvasFromChart();
    const dataUrl = canvas.toDataURL("image/png");

    FileSaver.saveAs(dataUrl, `${this.props.title}.png`);
  };

  public copyChartToClipboard = async () => {
    if (!isClipboardAPI()) {
      throw new Error("This browser don't support clipboard API");
    }

    const canvas = await this.getCanvasFromChart();

    canvas.toBlob(blob => {
      try {
        navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
      } catch (error) {
        console.log(error);
      }
    });
  };

  public render() {
    return (
      <div className="chart-actions">
        <Button size="small" color="primary" onClick={this.exportChartAsPNG}>
          Save Image
        </Button>
        {isClipboardAPI() && (
          <Button size="small" onClick={this.copyChartToClipboard}>
            Copy to clipboard
          </Button>
        )}
      </div>
    );
  }
}
