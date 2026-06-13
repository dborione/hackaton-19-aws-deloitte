import QuestionPage from "../questionPage";

const wantsFlowers = { id: "personalized_floral_compositions", equals: "yes" };

const questions = [
  { id: "personalized_floral_compositions", label: "Je souhaite une ou plusieurs compositions florales personnalisées :", type: "yesno" },
  { id: "favorite_flowers_type_color", label: "Type et couleur de mes fleurs préférées :", showIf: wantsFlowers },
  { id: "composition_types", label: "Type de composition(s) (couvre-cercueil, gerbe, coussin, couronnes, décoration florale du lieu de cérémonie, autre,…) :", type: "textarea", showIf: wantsFlowers },
  { id: "association_donation", label: "Don à une association :" },
  { id: "relatives_choose_flowers", label: "Je laisse mes proches choisir", type: "yesno", hideIf: wantsFlowers },
  { id: "no_flowers_no_wreaths", label: "« Ni fleurs ni couronnes »", type: "yesno", hideIf: wantsFlowers }
];

export default function Flowers({ token }) {
  return (
    <QuestionPage
      pageId="flowers"
      title="Fleurs"
      questions={questions}
      token={token}
    />
  );
}
