import React from "react";
import _ from "lodash";
import PersistenceService from "../services/PersistenceService";
import { useSelector } from "react-redux";
import { RootState } from "../data/store";
import { IViewPreferences } from "../pages/view";

interface ViewListProps {
  prefs: IViewPreferences;
}

export default function ViewList({ prefs }: ViewListProps) {
  const list = useSelector((state: RootState) => state.list);
  const text = PersistenceService.getListAsText(list);

  return (
    <pre>
      <code>{text}</code>
    </pre>
  );
}
