import QuestionPage from "../questionPage";

const chooseStaff = { id: "relatives_choose_staff", equals: "no" };

const questions = [
  { id: "relatives_choose_staff", label: "Je laisse mes proches choisir", type: "yesno" },
  { id: "master_of_ceremony", label: "Un maître de cérémonie", type: "yesno", showIf: chooseStaff },
  { id: "celebrant", label: "Un(e) célébrant(e)", type: "yesno", showIf: chooseStaff },
  { id: "bearers", label: "Porteurs :", type: "yesno", showIf: chooseStaff },
  { id: "bearers_family", label: "Famille", type: "yesno", showIf: { id: "bearers", equals: "yes" } },
  { id: "bearers_ag_funeral_staff", label: "Personnel d’A&G FUNERAL", type: "yesno", showIf: { id: "bearers", equals: "yes" } }
];

export default function Staff({ token }) {
  return (
    <QuestionPage
      pageId="staff"
      title="Personnel"
      questions={questions}
      token={token}
    />
  );
}
