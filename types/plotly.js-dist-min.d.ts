// Type shim for plotly.js-dist-min (no official @types package).
// The full plotly.js types from @types/plotly.js cover this bundle.
declare module "plotly.js-dist-min" {
  import type Plotly from "plotly.js";
  export = Plotly;
}
