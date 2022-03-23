import { AppBar, IconButton, Paper, Toolbar, Typography } from "@mui/material";
import BackIcon from "@mui/icons-material/ArrowBackIosNew";
import _ from "lodash";

export interface MenuBarProps {
  title: string;
  transparent?: boolean;
  onBackClick: () => void;
  right?: JSX.Element;
}

export function MenuBar(props: MenuBarProps) {
  const appBar = (
    <AppBar
      position="static"
      elevation={0}
      color={props.transparent ? "transparent" : undefined}
    >
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={props.onBackClick}
        >
          <BackIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {props.title}
        </Typography>
        {props.right}
      </Toolbar>
    </AppBar>
  );

  return props.transparent ? (
    appBar
  ) : (
    <Paper elevation={2} color="primary" square>
      {appBar}
    </Paper>
  );
}
