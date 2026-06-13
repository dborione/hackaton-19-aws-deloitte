import QuestionPage from "../questionPage";

const chooseReception = [
  { id: "no_reception", equals: "no" },
  { id: "relatives_choose_reception", equals: "no" }
];

const questions = [
  { id: "photo_slideshow", label: "Je souhaite la projection d’un diaporama photos (photos à annexer à votre dossier A&G Funeral) :", type: "textarea" },
  { id: "no_reception", label: "Je ne souhaite pas de réception après la cérémonie", type: "yesno" },
  { id: "relatives_choose_reception", label: "Je laisse mes proches choisir", type: "yesno", showIf: { id: "no_reception", equals: "no" } },
  { id: "recipe_or_favorite_treats", label: "Je transmets une recette qui me tient à coeur et/ou mes gourmandises préférées (recette à annexer) :", type: "textarea", showIf: chooseReception },
  { id: "chosen_place", label: "Lieu choisi :", showIf: chooseReception }
];

export default function SlideshowReception({ token }) {
  return (
    <QuestionPage
      pageId="slideshow-reception"
      title="Diaporama | Réception | Collation après la cérémonie"
      questions={questions}
      token={token}
    />
  );
}
