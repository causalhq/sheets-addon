import {
  Avatar,
  Card,
  ListItemAvatar,
  makeStyles,
  TextField,
  Tooltip,
  Typography,
  CardContent,
} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import DeleteIcon from "@material-ui/icons/Delete";
import React from "react";
import server from "../server";
import { Input } from "../State";
import "../styles.css";

export function validateInput(s: string) {
  const trimmed = s.trim();
  const match = trimmed.match(/^\(?(.*?) to (.*?)\)?$/);
  if (match === null) return false;
  const left = Number(match[1]);
  const right = Number(match[2]);
  return !Number.isNaN(left) && !Number.isNaN(right) && left < right;
}

interface CausalInputProps {
  input: Input;
  onDelete: () => void;
  onEdit: (newExpression: string) => void;
  isLast: boolean;
}
function CausalInput({ input, onDelete, onEdit, isLast }: CausalInputProps) {
  const useStyles = makeStyles({
    root: {},
  });

  const classes = useStyles();

  const error = !validateInput(input.expression);
  return (
    <>
      <ListItem className="inputs-list-item" classes={{ root: classes.root }}>
        <ListItemAvatar>
          <Avatar
            onClick={() => server.setActiveRange(input.sheetId, input.cell)}
          >
            {input.cell}
          </Avatar>
        </ListItemAvatar>
        <TextField
          label="Input range"
          fullWidth={true}
          defaultValue={input.expression}
          onChange={event => onEdit(event.target.value)}
          error={error}
          helperText={error && "Illegal expression, try '1 to 2'"}
        />
        <ListItemSecondaryAction>
          <Tooltip title="Remove input">
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
  inputs: Input[];
  onDelete: (index: number) => void;
  onEdit: (index: number, newExpression: string) => void;
}
export default function CausalInputs(props: Props) {
  return (
    <>
      <Typography gutterBottom variant="h3">
        Selected inputs
      </Typography>
      <Card variant="outlined">
        {props.inputs.length === 0 && (
          <div className="empty-state">
            You need at least 1 input — click above to create an input.
          </div>
        )}
        {props.inputs.length > 0 && (
          <List>
            {props.inputs.map((input, i) => (
              <CausalInput
                // weird issue doesn't rerender input if key doesn't change
                key={input.cell}
                input={input}
                onDelete={() => props.onDelete(i)}
                onEdit={newExpression => props.onEdit(i, newExpression)}
                isLast={i === props.inputs.length - 1}
              />
            ))}
          </List>
        )}
      </Card>
    </>
  );
}
