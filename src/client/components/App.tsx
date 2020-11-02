import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardHeader,
  Container,
  Divider,
  TextField,
  Tooltip,
} from "@material-ui/core";
import {
  createMuiTheme,
  makeStyles,
  ThemeProvider,
  withStyles,
} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import AddRoundedIcon from "@material-ui/icons/AddRounded";
import produce from "immer";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import server from "../server";
import { Simulation } from "../Simulation";
import { emptyState, readState, writeState } from "../State";
import CausalInputs, { validateInput } from "./CausalInputs";
import CausalOutputs from "./CausalOutputs";
import CausalSimulation from "./CausalSimulation";

const outerTheme = createMuiTheme({
  typography: {
    h1: {
      fontSize: "1.4rem",
      fontWeight: 400,
    },
    h2: {
      fontSize: "1rem",
      fontWeight: 500,
      color: "#333",
    },
    h3: {
      fontSize: "0.9rem",
      fontWeight: 500,
      color: "#a2a2a2",
      textTransform: "uppercase",
      letterSpacing: "0.01em",
      marginBottom: "2rem",
    },
    h4: {
      fontSize: "1.1rem",
    },
    h5: {
      fontSize: "1rem",
      color: "#4a4a4a",
    },
    body1: {
      color: "#333333",
    },
    body2: {
      color: "#828282",
    },
  },
  palette: {
    primary: {
      light: "#e2efff",
      main: "#4c7cb2",
    },
    secondary: {
      main: "#d65c5c",
    },
  },
});

export const useStyles = makeStyles({
  root: {
    background: "rgb(242, 242, 242)",
    paddingTop: "1em",
    paddingBottom: "1em",
  },
  tabBar: {
    background: "rgb(242, 242, 242)",
  },
});

const LightTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}))(Tooltip);

const doesNotWorkTooltip = (
  <LightTooltip
    title={
      <>
        Try opening an Incognito window or log out of all but one of your Gmail
        accounts. Some add-ons don't work for users who are signed in with
        multiple Gmail accounts. This is{" "}
        <a
          href="https://issuetracker.google.com/issues/69270374"
          target="_blank"
        >
          Google's issue
        </a>{" "}
        and we're waiting for them to fix it.
      </>
    }
    interactive
  >
    <a>Doesn't work?</a>
  </LightTooltip>
);

interface ActiveRange {
  range: string | null;
  formulas: string[] | null;
  sheetId: number;
}

export default function App() {
  const [simulation, setSimulation] = useState<Simulation>({ type: "empty" });
  const [openInput, setOpenInput] = useState<"input" | "output" | undefined>(
    undefined
  );
  const [activeRange, setActiveRange] = useState<ActiveRange | undefined>(
    undefined
  );
  useEffect(() => {
    const run = async () => {
      try {
        const range: any = await server.getActiveRange();
        if (!_.isEqual(range, activeRange)) {
          setActiveRange(range);
        }
      } catch (e) {
        console.log(e);
      }
    };
    run();
    const timer = setInterval(run, 250);
    return () => clearInterval(timer);
  }, [activeRange, setActiveRange]);

  const [state, setState] = useState(emptyState);
  useEffect(() => {
    (async () => {
      setState(await readState());
    })();
  }, []);
  const createInput = async (expression: string) => {
    setOpenInput(undefined);
    if (
      activeRange === undefined ||
      activeRange.range === null ||
      activeRange.range.includes(":")
    )
      return;
    const newState = produce(state, state => {
      state.inputs.push({
        cell: activeRange.range,
        sheetId: activeRange.sheetId,
        expression,
      });
    });
    setSimulation({ type: "empty" });
    // await server.setBorder(activeRange.range, "red", true);
    setState(newState);
    writeState(newState);
  };
  const onDeleteInput = async (index: number) => {
    const newState = produce(state, state => {
      state.inputs.splice(index, 1);
    });
    // await server.removeBorder(state.inputs[index].cell);
    setState(newState);
    setSimulation({ type: "empty" });
    writeState(newState);
  };
  const onEditInput = async (index: number, newExpression: string) => {
    const newState = produce(state, state => {
      state.inputs[index].expression = newExpression;
    });
    setState(newState);
    setSimulation({ type: "empty" });
    writeState(newState);
  };
  const createOutput = async (name: string) => {
    setOpenInput(undefined);
    if (activeRange === undefined || activeRange.range === null) return;
    const newState = produce(state, state => {
      state.outputs.push({ ...activeRange, name });
    });
    // await server.setBorder(activeRange.range, "blue", true);
    setState(newState);
    setSimulation({ type: "empty" });
    writeState(newState);
  };
  const onDeleteOutput = async (index: number) => {
    const newState = produce(state, state => {
      state.outputs.splice(index, 1);
    });
    // await server.removeBorder(state.outputs[index].range);
    setState(newState);
    setSimulation({ type: "empty" });
    writeState(newState);
  };
  const onEditOutput = async (index: number, newName: string) => {
    const newState = produce(state, state => {
      state.outputs[index].name = newName;
    });
    setState(newState);
    setSimulation({ type: "empty" });
    writeState(newState);
  };
  const resetState = async () => {
    setSimulation({ type: "empty" });
    setState(emptyState);
    writeState(emptyState);
  };

  const IS_CELL_SELECTED =
    activeRange !== undefined &&
    activeRange.range !== null &&
    activeRange.range !== "Z1000";

  const classes = useStyles();

  const CreateInput = ({ onCancel }: { onCancel: () => void }) => {
    const [inputText, setInputText] = useState("");
    const [error, setError] = useState(false);
    const handleInputSubmit = event => {
      event.preventDefault();
      if (inputText.length === 0) return;
      if (validateInput(inputText)) {
        createInput(inputText);
        setInputText("");
      } else {
        setError(true);
      }
    };
    return (
      <>
        <Typography gutterBottom variant="h3">
          New Input
        </Typography>
        <Card variant="outlined">
          <CardHeader title="Select a cell, then define its range:" />
          <CardHeader
            avatar={
              <Avatar aria-label="new-input-cell">
                {activeRange !== undefined ? activeRange.range : ""}
              </Avatar>
            }
            title={
              <TextField
                label="Input range"
                fullWidth={true}
                placeholder="5 to 10"
                error={error}
                helperText={
                  error
                    ? "Illegal expression, try '1 to 2'"
                    : "Enter a range for this cell's value"
                }
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={event => setInputText(event.target.value)}
                onKeyPress={event => {
                  if (event.key === "Enter") {
                    handleInputSubmit(event);
                  }
                }}
              />
            }
          />
          <form onSubmit={handleInputSubmit}>
            <CardActions>
              <Button size="small" color="secondary" onClick={onCancel}>
                Cancel
              </Button>
              <Button size="small" color="primary" type="submit">
                Create Input
              </Button>
            </CardActions>
          </form>
        </Card>
      </>
    );
  };

  const CreateOutput = ({ onCancel }: { onCancel: () => void }) => {
    const [outputText, setOutputText] = useState("");
    const handleOutputSubmit = event => {
      event.preventDefault();
      if (outputText.length === 0) return;
      createOutput(outputText);
      setOutputText("");
    };
    const hasFormula =
      activeRange.formulas !== null
        ? activeRange.formulas.some(formula => formula.startsWith("="))
        : true;

    return (
      <>
        <Typography gutterBottom variant="h3">
          New Output
        </Typography>
        <Card variant="outlined">
          <CardHeader title="Select a cell (or range of cells), then give them a name:" />
          <CardHeader
            avatar={
              <Avatar
                aria-label="new-input-cell"
                className={activeRange.range.includes(":") ? "rangeAvatar" : ""}
              >
                {activeRange !== undefined ? activeRange.range : ""}
              </Avatar>
            }
            title={
              <TextField
                label="Output name"
                fullWidth={true}
                placeholder="Revenue"
                helperText={
                  hasFormula
                    ? "Enter a name for this output variable"
                    : "The selected range needs to contain a formula"
                }
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={event => setOutputText(event.target.value)}
                onKeyPress={event => {
                  if (event.key === "Enter") {
                    handleOutputSubmit(event);
                  }
                }}
                error={!hasFormula}
              />
            }
          />
          <form onSubmit={handleOutputSubmit}>
            <CardActions>
              <Button size="small" color="secondary" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                size="small"
                color="primary"
                type="submit"
                disabled={!hasFormula || outputText.length === 0}
              >
                Create Output
              </Button>
            </CardActions>
          </form>
        </Card>
      </>
    );
  };
  return (
    <ThemeProvider theme={outerTheme}>
      <Container>
        <Typography gutterBottom variant="body1">
          <a href="https://www.youtube.com/embed/gXDNPTGqJ6g" target="_blank">
            Click here to watch a tutorial.
          </a>
        </Typography>
        <Typography gutterBottom variant="body1">
          Please get in touch if you have any problems:{" "}
          <a href="mailto:hi@causal.app" target="_blank">
            hi@causal.app
          </a>
        </Typography>
      </Container>
      <Divider />
      <Container>
        <Typography gutterBottom variant="h2">
          1. Inputs
        </Typography>
        <Typography gutterBottom variant="body2">
          These are hardcoded numbers (not formula cells) for which you are
          uncertain.
        </Typography>
      </Container>
      <Container classes={{ root: classes.root }}>
        {openInput === "input" ? (
          <>
            {!IS_CELL_SELECTED ? (
              <>Select a cell to create an input. {doesNotWorkTooltip}</>
            ) : (
              <CreateInput onCancel={() => setOpenInput(undefined)} />
            )}
          </>
        ) : (
          <Button
            size="small"
            variant="contained"
            color="primary"
            disableElevation
            onClick={async () => {
              setOpenInput("input");
            }}
            startIcon={<AddRoundedIcon />}
          >
            Create Input
          </Button>
        )}
        <div className="spacer"></div>
        <CausalInputs
          inputs={state.inputs}
          onDelete={onDeleteInput}
          onEdit={onEditInput}
        />
      </Container>

      <Container>
        <Typography gutterBottom variant="h2">
          2. Outputs
        </Typography>
        <Typography gutterBottom variant="body2">
          These are formula cells that are influenced by the selected inputs.
        </Typography>
      </Container>
      <Container classes={{ root: classes.root }}>
        {openInput === "output" ? (
          <>
            {!IS_CELL_SELECTED ? (
              <>Select a cell to create an output. {doesNotWorkTooltip}</>
            ) : (
              <CreateOutput onCancel={() => setOpenInput(undefined)} />
            )}
          </>
        ) : (
          <Button
            size="small"
            variant="contained"
            color="primary"
            disableElevation
            onClick={async () => {
              setOpenInput("output");
            }}
            startIcon={<AddRoundedIcon />}
          >
            Create Output
          </Button>
        )}
        <div className="spacer"></div>
        <CausalOutputs
          outputs={state.outputs}
          onDelete={onDeleteOutput}
          onEdit={onEditOutput}
        />
      </Container>

      <Container>
        <Typography gutterBottom variant="h2">
          3. Simulation
        </Typography>
        <Typography gutterBottom variant="body2">
          This runs the simulation.
        </Typography>
      </Container>
      <CausalSimulation
        state={state}
        simulation={simulation}
        setSimulation={setSimulation}
      />
      <Container>
        <Button size="small" color="secondary" onClick={resetState}>
          Reset Settings
        </Button>
      </Container>
      <Divider></Divider>
      <Container>
        <Typography gutterBottom variant="body1">
          Like this add-on? Check out{" "}
          <a href="https://causal.app" target="_blank">
            Causal
          </a>{" "}
          — a modelling tool built for scenarios and simulations.
          <br />
          <br />
        </Typography>
      </Container>
    </ThemeProvider>
  );
}
