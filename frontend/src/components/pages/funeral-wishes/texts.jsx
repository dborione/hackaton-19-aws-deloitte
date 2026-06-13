import QuestionPage from "../questionPage";

const chooseTexts = { id: "relatives_choose_texts", equals: "no" };

const questions = [
  { id: "relatives_choose_texts", label: "Je laisse mes proches choisir", type: "yesno" },
  { id: "significant_texts", label: "Je souhaite la lecture du (des) texte(s) significatif(s) suivant(s) :", type: "textarea", showIf: chooseTexts },
  { id: "last_message", label: "Je voudrais enregistrer ou partager un dernier message : (enregistrement sonore, petit film,... à annexer)", type: "textarea", showIf: chooseTexts }
];

export default function Texts({ token }) {
  return (
    <QuestionPage
      pageId="texts"
      title="Textes"
      questions={questions}
      token={token}
    />
  );
}
