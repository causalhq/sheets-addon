import {
  Avatar,
  Card,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  makeStyles,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import React from "react";
import server from "../server";
import { Output } from "../State";

function isCellRange(value: string) {
  return value.includes(":");
}

interface CausalOutputProps {
  output: Output;
  onDelete: () => void;
  onEdit: (newExpression: string) => void;
}
function CausalOutput({ output, onDelete, onEdit }: CausalOutputProps) {
  const useStyles = makeStyles({
    root: {},
  });

  const classes = useStyles();
  return (
    <>
      <ListItem className="inputs-list-item" classes={{ root: classes.root }}>
        <ListItemAvatar>
          <Avatar
            onClick={() => server.setActiveRange(output.sheetId, output.range)}
            className={isCellRange(output.range) ? "rangeAvatar" : ""}
          >
            {output.range}
          </Avatar>
        </ListItemAvatar>
        <TextField
          label="Output name"
          fullWidth={true}
          defaultValue={output.name}
          onChange={event => onEdit(event.target.value)}
        />
        <ListItemSecondaryAction>
          <Tooltip title="Remove output">
            <IconButton edge="end" aria-label="delete" onClick={onDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      </ListItem>
    </>
  );
}

interface Props {
  outputs: Output[];
  onDelete: (index: number) => void;
  onEdit: (index: number, newName: string) => void;
}
export default function CausalOutputs(props: Props) {
  return (
    <>
      <Typography gutterBottom variant="h3">
        Selected outputs
      </Typography>
      <Card variant="outlined">
        {props.outputs.length === 0 && (
          <div className="empty-state">
            You need at least 1 output — click above to create an output.
          </div>
        )}
        {props.outputs.length > 0 && (
          <List>
            {props.outputs.map((output, i) => (
              <CausalOutput
                // weird issue doesn't rerender input if key doesn't change
                key={output.range}
                output={output}
                onDelete={() => props.onDelete(i)}
                onEdit={newName => props.onEdit(i, newName)}
              />
            ))}
          </List>
        )}
      </Card>
    </>
  );
}
