import QuestionPage from "../questionPage";

const canVisit = { id: "relatives_can_visit", equals: "yes" };

const questions = [
  { id: "relatives_can_visit", label: "Je voudrais que mes proches puissent venir se recueillir près de moi", type: "yesno" },
  { id: "objects_in_or_on_coffin", label: "J’aimerais que l’on dépose les objets suivants dans / sur mon cercueil*", type: "textarea", showIf: canVisit },
  { id: "presentation_room_decoration", label: "Décoration de la salle de présentation :", type: "textarea", showIf: canVisit },
  { id: "personal_objects_to_present_or_flower", label: "Objet(s) personnel(s) à présenter ou fleurir (cf. section sur le parcours de vie) :", type: "textarea", showIf: canVisit },
  { id: "viewing_at_home", label: "À domicile (adresse privée) :", showIf: canVisit },
  { id: "viewing_place_of_residence", label: "Là où je résiderai si le lieu le permet (résidence, clinique) :", showIf: canVisit },
  { id: "viewing_ag_funeral_funeral_home", label: "Dans l’un des funérariums d’A&G Funeral :", showIf: canVisit },
  { id: "no_visit", label: "Je ne souhaite aucune visite", type: "yesno", hideIf: canVisit },
  { id: "family_chooses_viewing", label: "Je laisse ma famille choisir", type: "yesno", hideIf: canVisit }
];

export default function Viewing({ token }) {
  return (
    <QuestionPage
      pageId="viewing"
      title="Recueillement"
      questions={questions}
      token={token}
    />
  );
}
