import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import "../styles.css";

interface Props {
  prompt: string;
  onSubmit: (value: string) => void;
}
export default function TextInput(props: Props) {
  const [text, setText] = useState("");

  const handleChange = (event) => setText(event.target.value);

  // PropertiesService.getDocumentProperties().setProperty("inputNames", "");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (text.length === 0) return;

    props.onSubmit(text);
    setText("");
  };

  return (
    <div className="formBlock">
      <span className="prompt">{props.prompt}</span>
      <form onSubmit={handleSubmit}>
        <input onChange={handleChange} value={text} />
      </form>
    </div>
  );
}
