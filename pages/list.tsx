import Head from "next/head";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../data/store";
import { useRouter } from "next/router";
import { useMediaQuery } from "react-responsive";
import MobileView from "../views/listBuilder/MobileView";
import DesktopView from "../views/listBuilder/DesktopView";
import { setGameRules } from "../data/armySlice";
import { gameSystemToSlug } from "../services/Helpers";
import PersistenceService from "../services/PersistenceService";

export default function List() {
  const armyState = useSelector((state: RootState) => state.army);
  const appState = useSelector((state: RootState) => state.app);
  const router = useRouter();
  const dispatch = useDispatch();

  // Load army list file
  useEffect(() => {
    // Redirect to game selection screen if no army selected
    if (!armyState.loaded) {
      const listId = router.query["listId"] as string;
      if (listId) {
        PersistenceService.loadFromKey(dispatch, listId, (armyData) => {});
        return;
      }

      router.push({ pathname: "/gameSystem", query: router.query }, null, {
        shallow: true,
      });
      return;
    }

    // AF to Web Companion game type mapping
    const slug = gameSystemToSlug(armyState.gameSystem);

    // Load army rules
    fetch(
      `https://webapp.onepagerules.com/api/content/game-systems/${slug}/special-rules`
    )
      .then((res) => res.json())
      .then((res) => {
        const rules = res.map((rule) => ({
          name: rule.name,
          description: rule.description,
        }));
        dispatch(setGameRules(rules));
      });
  }, []);

  // Break from mobile to desktop layout at 1024px wide
  const isBigScreen = useMediaQuery({ query: "(min-width: 1024px)" });

  return (
    <>
      <Head>
        <title>OPR Army Forge</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {armyState.loaded ? isBigScreen ? <DesktopView /> : <MobileView /> : null}
    </>
  );
}
