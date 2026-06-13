import QuestionPage from "../questionPage";

const chooseMusic = [
  { id: "no_music", equals: "no" },
  { id: "relatives_choose_music", equals: "no" }
];

export const questions = [
  { id: "no_music", label: "Je préfère qu’il n’y ait pas de musique", type: "yesno" },
  { id: "relatives_choose_music", label: "Je laisse mes proches choisir", type: "yesno", showIf: { id: "no_music", equals: "no" } },
  { id: "desired_music_accompaniment", label: "Je souhaite l’accompagnement suivant :", type: "textarea", showIf: chooseMusic },
  { id: "choir_musicians_soloist", label: "J’aimerais une chorale / plusieurs musiciens / un soliste :", type: "textarea", showIf: chooseMusic }
];

export default function Music({ token }) {
  return (
    <QuestionPage
      pageId="music"
      title="Accompagnement musical"
      questions={questions}
      token={token}
    />
  );
}
