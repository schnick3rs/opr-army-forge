import React from "react";
import _ from "lodash";
import PersistenceService from "../services/PersistenceService";
import { useSelector } from "react-redux";
import { RootState } from "../data/store";

export default function ViewList({
  showPsychic,
  showFullRules,
  showPointCosts,
}) {
  
  const list = useSelector((state: RootState) => state.list);
  const text = PersistenceService.getListAsText(list);

  return (
    <pre>
      <code>{text}</code>
    </pre>
  );
}
