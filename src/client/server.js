/*
Convert google script server calls to more
familiar js/promise-based functions.
*/

const serverMethods = {};

if (process.env.NODE_ENV === "development") {
  serverMethods.setBorder = () => {};
  serverMethods.removeBorder = () => {};
  serverMethods.getDocumentProperty = () =>
    `{"inputs":[{"cell":"A1","sheetId":0,"expression":"1 to 4"},{"cell":"A2","sheetId":0,"expression":"5 to 8"}],"outputs":[{"range":"A3:C3","sheetId":0,"name":"out"}, {"range":"C3","sheetId":0,"name":"output 2"}]}`;
  serverMethods.setDocumentProperty = () => {};
  serverMethods.setActiveRange = () => console.log("CLICK");
  // serverMethods.getActiveRange = () => ({
  //   range: "A1",
  //   sheetId: 2,
  //   formulas: ["=A2"],
  // });
  serverMethods.getActiveRange = () => undefined;
  serverMethods.startSimulation = () => ({
    inputs: [
      [3.4636105308327485, 5.152095248553668],
      [1.3504015549309407, 5.828236583189974],
      [3.6517121992735166, 7.7988777005630325],
      [3.230246674394698, 6.454390349726689],
      [3.4684005019846778, 5.968511695203551],
      [2.743546038129705, 7.6760575057163685],
      [2.564494594574269, 5.883896648948674],
      [3.76618688211107, 7.233105695718486],
      [2.0428264287683158, 6.36671694762126],
      [1.853529474515393, 6.64204073755826],
    ],
    outputs: [
      [[[11.615705779386417, 3.4636105308327485, 5.152095248553668]], [[1]]],
      [[[10.178638138120915, 1.3504015549309407, 5.828236583189974]], [[1]]],
      [[[14.45058989983655, 3.6517121992735166, 7.7988777005630325]], [[1]]],
      [[[12.684637024121386, 3.230246674394698, 6.454390349726689]], [[1]]],
      [[[12.436912197188228, 3.4684005019846778, 5.968511695203551]], [[1]]],
      [[[13.419603543846073, 2.743546038129705, 7.6760575057163685]], [[1]]],
      [[[11.448391243522943, 2.564494594574269, 5.883896648948674]], [[1]]],
      [[[13.999292577829555, 3.76618688211107, 7.233105695718486]], [[1]]],
      [[[11.409543376389575, 2.0428264287683158, 6.36671694762126]], [[1]]],
      [[[11.495570212073654, 1.853529474515393, 6.64204073755826]], [[1]]],
    ],
  });
} else {
  // skip the reserved methods
  const ignoredMethods = [
    "withFailureHandler",
    "withLogger",
    "withSuccessHandler",
    "withUserObject",
  ];

  for (const method in google.script.run) {
    if (!ignoredMethods.includes(method)) {
      serverMethods[method] = (...args) => {
        return new Promise((resolve, reject) => {
          const handler = google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(reject);
          handler[method](...args);
        });
      };
    }
  }
}

export default serverMethods;
