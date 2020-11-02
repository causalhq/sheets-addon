import _ from "lodash";
import numbro from "numbro";

export function formatValue(value?: number): string {
  if (!value) return "";
  let rounded = Number(value.toPrecision(5));

  const length = String(Number(rounded)).replace(".", "").length;

  const baseFormat = {
    average: true,
    mantissa: Math.min(length, 3),
    trimMantissa: true,
  };

  if (Math.abs(rounded) >= 1000) {
    baseFormat.mantissa = 1;
  } else if (Math.abs(rounded) >= 100) {
    rounded = Number(rounded.toFixed(0));
    baseFormat.mantissa = 1;
  } else if (Math.abs(rounded) >= 10) {
    baseFormat.mantissa = 2;
  } else if (Math.abs(rounded) >= 1) {
    baseFormat.mantissa = 2;
  } else if (Math.abs(rounded) > 0.1) {
    baseFormat.mantissa = 2;
  } else if (Math.abs(rounded) > 0.01) {
    baseFormat.mantissa = 3;
  } else if (Math.abs(rounded) >= 0.001) {
    baseFormat.mantissa = 4;
  } else {
    const numZeroes = String(Number(value)).split("0").length;
    baseFormat.mantissa = Math.min(numZeroes, length, 1);
  }

  return numbro(rounded).format(baseFormat);
}
