import { useState } from "react";
import { useLongPress } from "use-long-press";
import { CustomTooltip } from "./CustomTooltip";

export default function RuleItem({ label, description }) {
  const [open, setOpen] = useState(false);

  const bindLongPress = useLongPress(() => setOpen(true), {
    cancelOnMovement: 5,
  });

  const bullet = /•|/;
  const descParts = description.split(bullet).map((part) => <p key={part}>{part}</p>);

  let content = description ? (
    <CustomTooltip title={descParts} arrow open={open} onClose={() => setOpen(false)}>
      <span
        {...bindLongPress()}
        style={{
          textDecoration: "underline",
          textDecorationStyle: "dashed",
          textDecorationColor: "#666",
          textUnderlineOffset: "4px",
        }}
      >
        {label}
      </span>
    </CustomTooltip>
  ) : (
    <span>{label}</span>
  );

  return content;
}
