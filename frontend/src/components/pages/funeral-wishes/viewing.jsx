import QuestionPage from "../questionPage";

const canVisit = { id: "relatives_can_visit", equals: "yes" };

export const questions = [
  { id: "relatives_can_visit", label: "I would like my relatives to be able to come and pay their respects near me", type: "yesno", category: "easy" },
  { id: "objects_in_or_on_coffin", label: "I would like the following objects to be placed in or on my coffin:", type: "textarea", showIf: canVisit, category: "easy" },
  { id: "presentation_room_decoration", label: "Presentation room decoration:", type: "textarea", showIf: canVisit, category: "easy" },
  { id: "personal_objects_to_present_or_flower", label: "Personal object(s) to display or decorate with flowers, see life story section:", type: "textarea", showIf: canVisit, category: "easy" },
  { id: "viewing_at_home", label: "At home, private address:", showIf: canVisit, category: "technical" },
  { id: "viewing_place_of_residence", label: "Where I will be living, if the place allows it, residence or clinic:", showIf: canVisit, category: "technical" },
  { id: "viewing_ag_funeral_funeral_home", label: "In one of A&G Funeral's funeral homes:", showIf: canVisit, category: "technical" },
  { id: "no_visit", label: "I do not want any visits", type: "yesno", hideIf: canVisit, category: "easy" },
  { id: "family_chooses_viewing", label: "I let my family choose", type: "yesno", hideIf: canVisit, category: "easy" }
];

export default function Viewing({ token }) {
  return (
    <QuestionPage
      pageId="viewing"
      title="Viewing and Paying Respects"
      questions={questions}
      token={token}
    />
  );
}
