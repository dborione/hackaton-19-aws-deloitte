import QuestionPage from "../questionPage";

const chooseVehicle = { id: "family_chooses_vehicle", equals: "no" };

export const questions = [
  { id: "family_chooses_vehicle", label: "Je laisse ma famille choisir", type: "yesno" },
  { id: "hearse", label: "Un corbillard", type: "yesno", showIf: chooseVehicle },
  { id: "funeral_van", label: "Un fourgon funéraire", type: "yesno", showIf: chooseVehicle },
  { id: "vehicle_other", label: "Autre :", showIf: chooseVehicle }
];

export default function Vehicles({ token }) {
  return (
    <QuestionPage
      pageId="vehicles"
      title="Véhicules"
      questions={questions}
      token={token}
    />
  );
}
