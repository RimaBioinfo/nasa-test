import { Link, useNavigate, useParams } from "react-router-dom";
import { GuidedFlow } from "../components/GuidedFlow.jsx";
import { ErrorBox, Loading } from "../components/ui.jsx";
import { useApi } from "../hooks/useApi.js";
import { getCheckups, getExperiments, saveExperimentResult } from "../services/api.js";

/** /run/:source/:id where source is "checkup" or "experiment". */
export default function RunTestPage() {
  const { source, id } = useParams();
  const navigate = useNavigate();
  const isCheckup = source === "checkup";
  const { data, loading, error } = useApi(isCheckup ? getCheckups : getExperiments, [source]);
  const backTo = isCheckup ? "/checkups" : "/experiments";

  if (loading) return <Loading what="test" />;
  if (error) return <ErrorBox error={error} />;

  const test = data?.find((t) => t.id === id);
  if (!test?.steps?.length) {
    return (
      <section className="panel">
        <h1>Test not found</h1>
        <p className="muted" style={{ margin: "8px 0 16px" }}>
          There is no guided version of this test.
        </p>
        <Link className="btn" to={backTo}>
          Go back
        </Link>
      </section>
    );
  }

  return (
    <GuidedFlow
      key={`${source}-${id}`}
      testId={test.id}
      title={test.name}
      steps={test.steps}
      onSave={(answers) => saveExperimentResult(test.id, answers)}
      onExit={() => navigate(-1)}
      doneActions={
        <>
          <Link className="btn btn-primary" to="/">
            Back to home
          </Link>
          <Link className="btn btn-ghost" to={backTo}>
            {isCheckup ? "All checkups" : "More experiments"}
          </Link>
        </>
      }
    />
  );
}
