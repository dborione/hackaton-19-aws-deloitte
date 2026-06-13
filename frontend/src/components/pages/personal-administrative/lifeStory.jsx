import QuestionPage from "../questionPage";

const questions = [
  { id: "family_story", label: "Mon histoire familiale :" },
  { id: "professional_path", label: "Mon parcours professionnel :" },
  { id: "honorary_distinctions", label: "Distinction(s) honorifique(s) :" },
  { id: "passions_hobbies_interests", label: "Mes passions et loisirs, mes centres d’intérêts :" },
  { id: "life_motto", label: "Ma devise dans la vie :" },
  { id: "beautiful_memory", label: "Un beau souvenir, de bons moments :" }
];

export default function LifeStory({ token }) {
  return (
    <QuestionPage
      pageId="life-story"
      title="Parcours de vie | Personnalisation"
      questions={questions}
      token={token}
    />
  );
}
