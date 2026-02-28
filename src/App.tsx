import { useState } from "react";
import WelcomePage from "./WelcomePage";
import ProblemPage from "./ProblemPage";

type Page = "welcome" | "problem";

export default function App() {
  const [page, setPage] = useState<Page>("welcome");

  if (page === "problem") {
    return <ProblemPage />;
  }

  return <WelcomePage onStart={() => setPage("problem")} />;
}
