/* eslint-disable */

// the V8 runtime can't handle multiple accounts (https://issuetracker.google.com/issues/150247026)
// so everything in this file needs to be ES5 compliant
// run yarn es5_check to verify this

// check permissions if you need to do sth non-trivial in onOpen
// see https://developers.google.com/apps-script/reference/script/auth-mode
function onOpen(e) {
  SpreadsheetApp.getUi()
    .createAddonMenu()
    .addItem("Launch", "openSidebar")
    .addToUi();

  // eslint-disable-next-line no-undef
  console.log("Running version (server):", ADDON_VERSION);
}

function onInstall(e) {
  onOpen(e);
}

function openSidebar() {
  var html = HtmlService.createHtmlOutputFromFile("main").setTitle(
    "Causal - Scenarios"
  );
  SpreadsheetApp.getUi().showSidebar(html);
}

// global.openDialog = () => {
//   var html = HtmlService.createHtmlOutputFromFile('main')
//     .setWidth(400)
//     .setHeight(600);
//   SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
//     .showModalDialog(html, 'Sheet Editor');
// };

function setDocumentProperty(key, value) {
  try {
    PropertiesService.getDocumentProperties().setProperty(key, value);
  } catch (e) {
    console.error(e);
  }
}
function getDocumentProperty(key) {
  try {
    return PropertiesService.getDocumentProperties().getProperty(key);
  } catch (e) {
    console.error(e);
    return "";
  }
}
// Array.prototype.flat doesn't exist in ES5
function flatten(arrays) {
  return [].concat.apply([], arrays);
}
function getActiveRange() {
  var sheet = SpreadsheetApp.getActive();
  var range = SpreadsheetApp.getActiveRange();

  var res = {
    range: range === null ? null : range.getA1Notation(),
    sheetId: sheet.getSheetId(),
    formulas: range === null ? null : flatten(range.getFormulas()),
  };
  return res;
}
function setActiveRange(sheetId, range) {
  var sheets = SpreadsheetApp.getActive().getSheets();
  var sheet = sheets.filter(function(s) {
    return s.getSheetId() === sheetId;
  })[0];
  if (sheet === undefined) return;
  var rangeObj = sheet.getRange(range);
  SpreadsheetApp.setActiveSheet(sheet);
  SpreadsheetApp.setActiveRange(rangeObj);
}

function illegal(s, i) {
  return {
    error: s + " " + String(i + 1) + " is illegal",
  };
}

// simulation
function startSimulation(state) {
  console.log("startSimulation");
  var sheets = SpreadsheetApp.getActive().getSheets();

  // save initial values
  var initialValues = [];
  var inputRanges = [];
  for (var i = 0; i < state.inputs.length; i += 1) {
    var sheet = sheets.filter(function(s) {
      return s.getSheetId() === state.inputs[i].sheetId;
    })[0];
    if (sheet === undefined) return illegal("Input", i);
    var range = sheet.getRange(state.inputs[i].cell);
    initialValues.push(range.getValue());
    inputRanges.push(range);
  }
  var inputs = [];
  var outputs = [];

  var parsedInputs = [];
  for (var i = 0; i < state.inputs.length; i += 1) {
    var split = state.inputs[i].expression.split(" to ");
    if (split.length !== 2) {
      return illegal("Input", i);
    }
    var from = Number(split[0]);
    var to = Number(split[1]);
    if (isNaN(from) || isNaN(to)) {
      return illegal("Input", i);
    }
    parsedInputs.push([from, to]);
  }
  var outputRanges = [];
  for (var i = 0; i < state.outputs.length; i += 1) {
    var sheet = sheets.filter(function(s) {
      return s.getSheetId() === state.outputs[i].sheetId;
    })[0];
    if (sheet === undefined) return illegal("Output", i);
    outputRanges.push(sheet.getRange(state.outputs[i].range));
  }
  // run
  for (var iteration = 0; iteration < 20; iteration += 1) {
    var input = [];
    for (var i = 0; i < state.inputs.length; i += 1) {
      var value =
        parsedInputs[i][0] +
        Math.random() * (parsedInputs[i][1] - parsedInputs[i][0]);
      inputRanges[i].setValue(value);
      input.push(value);
    }
    inputs.push(input);
    // SpreadsheetApp.flush();
    var output = [];
    for (var i = 0; i < state.outputs.length; i += 1) {
      output.push(outputRanges[i].getValues());
    }
    outputs.push(output);
  }

  // set initial values
  for (var i = 0; i < state.inputs.length; i += 1) {
    inputRanges[i].setValue(initialValues[i]);
  }
  // SpreadsheetApp.flush();

  return { inputs: inputs, outputs: outputs };
}

// fast/hidden simulation
function transformInputs(a) {
  var transformed = [];
  for (var i = 0; i < a.length; i += 1) {
    transformed.push([a[i]]);
  }
  return transformed;
}

function transformOutputs(a) {
  var transformed = [];
  for (var i = 0; i < a.length; i += 1) {
    transformed.push([[a[i][0]]]);
  }
  return transformed;
}

function startHiddenSimulation(state) {
  console.log("startHiddenSimulation");

  var hiddenSheetName = "SuperSecretSheetForCausalCalculations";

  var sheet = SpreadsheetApp.getActiveSheet();
  var sheetName = sheet.getName();

  var hiddenSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    hiddenSheetName
  );

  if (hiddenSheet === null) {
    hiddenSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet();
    hiddenSheet.hideSheet();
    hiddenSheet.setName(hiddenSheetName);
  }

  SpreadsheetApp.setActiveSheet(sheet);

  // save initial values and link cells to hidden sheet
  var initialValues = [];
  for (var i = 0; i < state.inputs.length; i += 1) {
    initialValues.push(sheet.getRange(state.inputs[i].cell).getValue());
    sheet
      .getRange(state.inputs[i].cell)
      .setValue("=" + hiddenSheetName + "!A" + String(i + 1));
  }

  // first row for inputs
  var inputRange = hiddenSheet.getRange(1, 1, 1, state.inputs.length);
  // one row for each output (B...)
  var outputRange = hiddenSheet.getRange(2, 1, state.outputs.length + 1, 1);

  for (var i = 0; i < state.outputs.length; i += 1) {
    outputRange
      .setValues([
        state.outputs.map(function(output) {
          return "=" + sheetName + "!" + output.cell;
        }),
      ])
      .getCell(i + 1, 1)
      .setValue();
  }

  var inputs = [];
  var outputs = [];

  var parsedInputs = [];
  for (var i = 0; i < state.inputs.length; i += 1) {
    var split = state.inputs[i].expression.split(" to ");
    if (split.length !== 2) {
      return illegal("Input", i);
    }
    var from = Number(split[0]);
    var to = Number(split[1]);
    if (isNaN(from) || isNaN(to)) {
      return illegal("Input", i);
    }
    parsedInputs.push([from, to]);
  }
  // run
  for (var iteration = 0; iteration < 10; iteration += 1) {
    var input = [];
    for (var i = 0; i < state.inputs.length; i += 1) {
      var value =
        parsedInputs[i][0] +
        Math.random() * (parsedInputs[i][1] - parsedInputs[i][0]);
      input.push(value);
    }

    inputRange.setValues(transformInputs(input));
    SpreadsheetApp.flush();
    inputs.push(input);
    var output = transformOutputs(outputRange.getValues());

    outputs.push(output);
  }

  // set initial values
  for (var i = 0; i < state.inputs.length; i += 1) {
    sheet.getRange(state.inputs[i].cell).setValue(initialValues[i]);
  }

  return { inputs: inputs, outputs: outputs };
}
