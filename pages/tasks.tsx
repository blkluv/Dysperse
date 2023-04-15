import Head from "next/head";
import { TasksLayout } from "../components/Boards/Layout";

/**
 * Top-level component for the dashboard page.
 */
export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Tasks</title>
      </Head>
      <TasksLayout />
    </>
  );
}
