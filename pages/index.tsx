import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import { Button, createTheme } from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import AddIcon from "@mui/icons-material/Add";
import NotificationBanner from "../views/components/NotificationBanner";
import { GetServerSidePropsContext } from "next";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const host = context.req.headers.host;
  const vercelProd = "opr-army-forge.vercel.app";
  const isVercelProd = host?.toLocaleLowerCase() === vercelProd;

  return isVercelProd
    ? {
        redirect: {
          permanent: true,
          destination: "https://army-forge.onepagerules.com/",
        },
      }
    : { props: {} };
}

export default function Home() {
  const router = useRouter();

  let canUseRegexLookahead = false;
  try {
    const match = new RegExp("q(?=u)").exec("qu");
    if (match) {
      canUseRegexLookahead = true;
    }
  } catch (e) {
    console.warn("Your browser does not support regex lookahead.");
  }

  return (
    <>
      <NotificationBanner />
      <div className={styles.homeContainer + " container"}>
        <div className={styles.outerColumn}>
          <div className={styles.homeColumn + " mx-auto has-text-centered p-4 pt-6"}>
            <div>
              <h1 className={styles.title} style={{ letterSpacing: "8px" }}>
                ARMY
              </h1>
              <div className={styles.logo + " mx-auto"}></div>
              <h1 className={styles.title}>
                FORGE
                <div className={styles.betaTag}></div>
              </h1>
            </div>

            <div className={styles.buttonContainer + " is-flex is-flex-direction-column p-4"}>
              {canUseRegexLookahead ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    className="mb-4"
                    onClick={() => router.push("/gameSystem")}
                  >
                    <AddIcon />{" "}
                    <span className="ml-2" style={{ fontWeight: 600 }}>
                      Create A New List
                    </span>
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      borderColor: "white",
                      color: "white",
                      background: "rgba(255,255,255,.2)",
                      "&:hover": {
                        borderColor: "white",
                        background: "rgba(255,255,255,.3)",
                      },
                    }}
                    onClick={() => router.push("/load")}
                  >
                    <FolderOpenIcon />{" "}
                    <span className="ml-2" style={{ fontWeight: 600 }}>
                      Open A List
                    </span>
                  </Button>
                </>
              ) : (
                <div className="notification is-danger">Sorry, your browser is not supported!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
