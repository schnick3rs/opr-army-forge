import { useDispatch } from 'react-redux'
import { setGameSystem } from '../data/armySlice'
import { useRouter } from 'next/router';
import { AppBar, IconButton, Paper, Toolbar, Typography } from '@mui/material';
import BackIcon from '@mui/icons-material/ArrowBackIosNew';
import { useEffect } from 'react';
import NotificationBanner from '../views/components/NotificationBanner';

export default function GameSystem() {

  const dispatch = useDispatch();
  const router = useRouter();
  const isLive = true;
  const isLive2 = typeof (window) !== "undefined"
    ? window.location.host === "opr-army-forge.vercel.app" || window.location.host === "army-forge.onepagerules.com"
    : true;

  const gameSystems = ["gf", "gff", "aof", "aofs"];
  const liveGameSystems = ["gf"];//, "aof"];

  const selectGameSystem = (gameSystem: string) => {
    dispatch(setGameSystem(gameSystem));
    router?.push({ pathname: "/files", query: { ...router.query, gameSystem: gameSystem } });
  };

  useEffect(() => {
    if (router.query) {
      console.log(router.query)
      let gameSystem = router.query.gameSystem as string
      if (gameSystems.includes(gameSystem)) selectGameSystem(gameSystem)
    }
  }, []);

  return (
    <>
      <NotificationBanner />
      <Paper elevation={2} color="primary" square>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={() => router.push("/")}
            >
              <BackIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Create a new list
            </Typography>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
            >
            </IconButton>
          </Toolbar>
        </AppBar>
      </Paper>
      <div className="container">
        <div className="mx-auto p-4" style={{ maxWidth: "480px" }}>
          <h3 className="is-size-4 has-text-centered mb-4">Select Game System</h3>
          <div className="columns is-multiline is-mobile">
            {
              // For each game system
              gameSystems.map(gameSystem => {

                const enabled = isLive ? liveGameSystems.indexOf(gameSystem) >= 0 : true;
                console.log(gameSystem, enabled);
                return (
                  <div key={gameSystem} className="column is-half">
                    <Paper>
                      <img onClick={() => enabled ? selectGameSystem(gameSystem) : false} src={`img/${gameSystem}_cover.jpg`}
                        className={"game-system-tile " + (enabled ? "interactable" : "")}
                        style={{ borderRadius: "4px", display: "block", filter: enabled ? null : "grayscale(95%)" }} />
                    </Paper>
                  </div>
                );
              })
            }
          </div>
        </div>

      </div>
    </>
  );
}
