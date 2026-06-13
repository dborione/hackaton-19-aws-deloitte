import QuestionPage from "../questionPage";

const chooseStaff = { id: "relatives_choose_staff", equals: "no" };

export const questions = [
  { id: "relatives_choose_staff", label: "I let my relatives choose", type: "yesno", category: "easy" },
  { id: "master_of_ceremony", label: "Master of ceremonies", type: "yesno", showIf: chooseStaff, category: "technical" },
  { id: "celebrant", label: "Celebrant", type: "yesno", showIf: chooseStaff, category: "technical" },
  { id: "bearers", label: "Bearers:", type: "yesno", showIf: chooseStaff, category: "easy" },
  { id: "bearers_family", label: "Family", type: "yesno", showIf: { id: "bearers", equals: "yes" }, category: "easy" },
  { id: "bearers_ag_funeral_staff", label: "A&G Funeral staff", type: "yesno", showIf: { id: "bearers", equals: "yes" }, category: "technical" }
];

export default function Staff({ token }) {
  return (
    <QuestionPage
      pageId="staff"
      title="Staff"
      questions={questions}
      token={token}
    />
  );
}
