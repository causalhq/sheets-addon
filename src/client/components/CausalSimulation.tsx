import {
  AppBar,
  Button,
  Card,
  CardActions,
  Container,
  Tab,
  Tabs,
} from "@material-ui/core";
import PlayArrowRoundedIcon from "@material-ui/icons/PlayArrowRounded";
import React, { useState } from "react";
import server from "../server";
import {
  combineSimulationResults,
  getSimulationResult,
  Simulation,
} from "../Simulation";
import { State } from "../State";
import { useStyles } from "./App";
import CellResult from "./CellResult";
import RangeResult from "./RangeResult";
import CircularProgress from "@material-ui/core/CircularProgress";

interface Props {
  state: State;
  simulation: Simulation;
  setSimulation: (s: Simulation) => void;
}
export default function CausalSimulation({
  state,
  simulation,
  setSimulation,
}: Props) {
  const startSimulation = async () => {
    setSimulation({ type: "loading" });
    try {
      console.time("simulation");
      const res = await server.startSimulation(state);
      console.timeEnd("simulation");
      if (res.error !== undefined) {
        setSimulation({ type: "error", error: res.error });
        console.log(res.error);
      } else {
        setSimulation({
          type: "value",
          value: {
            inputs: res.inputs,
            outputs: res.outputs,
          },
        });
      }
    } catch (e) {
      console.log(e);
      setSimulation({ type: "error", error: e.message });
    }
  };
  const moreSimulations = async () => {
    const lastValue = getSimulationResult(simulation);
    setSimulation({
      type: "loading",
      lastValue,
    });
    try {
      console.time("simulation");
      const res = await server.startSimulation(state);
      console.timeEnd("simulation");
      if (res.error !== undefined) {
        setSimulation({ type: "error", error: res.error });
        console.log(res.error);
      } else {
        setSimulation({
          type: "value",
          value: combineSimulationResults(res, lastValue),
        });
      }
    } catch (e) {
      console.log(e);
      setSimulation({ type: "error", error: e.message });
    }
  };

  const resetSimulation = () => setSimulation({ type: "empty" });

  const [tabIndex, setTabIndex] = useState(0);

  const classes = useStyles();

  switch (simulation.type) {
    case "empty":
      return (
        <Container>
          <Button
            size="small"
            color="primary"
            variant="contained"
            onClick={startSimulation}
            disableElevation
            startIcon={<PlayArrowRoundedIcon />}
            disabled={state.inputs.length === 0 || state.outputs.length === 0}
          >
            Run Simulation
          </Button>
        </Container>
      );
    case "error":
      if (
        simulation.error.includes(
          "You do not have permission to access the requested document."
        )
      ) {
        return (
          <>
            Google doesn't let us access this spreadsheet. Click "File > Make a
            copy" and try again.
          </>
        );
      }
      return <>{simulation.error}</>;
    case "loading":
    case "value":
      const isLoading = simulation.type === "loading";
      const simulationValue = getSimulationResult(simulation);
      return (
        <>
          {/* <Container>
            {simulationValue !== undefined &&
              `Number of simulations: ${simulationValue.inputs.length}`}
          </Container> */}
          <AppBar
            position="static"
            color="primary"
            classes={{ root: classes.tabBar }}
          >
            <Tabs
              value={tabIndex}
              onChange={(e, newValue) => setTabIndex(newValue)}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              {state.outputs.map((output, i) => {
                return <Tab label={output.name} />;
              })}
            </Tabs>
          </AppBar>
          <Card variant="outlined" square>
            {isLoading && <CircularProgress />}
            {state.outputs.map((output, i) => {
              if (simulationValue === undefined || tabIndex !== i) return null;
              const results = simulationValue.outputs.map(output => output[i]);
              if (output.range.includes(":"))
                return (
                  <RangeResult
                    key={i}
                    output={output}
                    results={results}
                    inputs={state.inputs}
                  />
                );
              else {
                const values = results.map(r => r[0][0]);
                return <CellResult key={i} output={output} values={values} />;
              }
            })}
            <CardActions>
              {!isLoading && (
                <Button color="primary" onClick={moreSimulations}>
                  Run more simulations
                </Button>
              )}
              {/* <Tooltip title="Re-run simulation">
                <IconButton color="primary" onClick={resetSimulation}>
                  <ReplayIcon />
                </IconButton>
              </Tooltip> */}
            </CardActions>
          </Card>
        </>
      );
  }
}
