import QuestionPage from "../questionPage";

const wantsFlowers = { id: "personalized_floral_compositions", equals: "yes" };

export const questions = [
  { id: "personalized_floral_compositions", label: "I would like one or more personalized floral arrangements", type: "yesno", category: "easy" },
  { id: "favorite_flowers_type_color", label: "Type and color of my favorite flowers:", showIf: wantsFlowers, category: "easy" },
  { id: "composition_types", label: "Type of arrangement: coffin spray, bouquet, cushion, wreath, floral decoration for the ceremony location, other, etc.", type: "textarea", showIf: wantsFlowers, category: "easy" },
  { id: "association_donation", label: "Donation to an association:", category: "technical" },
  { id: "relatives_choose_flowers", label: "I let my relatives choose", type: "yesno", hideIf: wantsFlowers, category: "easy" },
  { id: "no_flowers_no_wreaths", label: "No flowers or wreaths", type: "yesno", hideIf: wantsFlowers, category: "easy" }
];

export default function Flowers({ token }) {
  return (
    <QuestionPage
      pageId="flowers"
      title="Flowers"
      questions={questions}
      token={token}
    />
  );
}
