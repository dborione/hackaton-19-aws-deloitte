import QuestionPage from "../questionPage";

const chooseVehicle = { id: "family_chooses_vehicle", equals: "no" };

export const questions = [
  { id: "family_chooses_vehicle", label: "I let my family choose", type: "yesno", category: "easy" },
  { id: "hearse", label: "Hearse", type: "yesno", showIf: chooseVehicle, category: "documents" },
  { id: "funeral_van", label: "Funeral van", type: "yesno", showIf: chooseVehicle, category: "documents" },
  { id: "vehicle_other", label: "Other vehicle:", showIf: chooseVehicle, category: "easy" }
];

export default function Vehicles({ token }) {
  return (
    <QuestionPage
      pageId="vehicles"
      title="Vehicles"
      questions={questions}
      token={token}
    />
  );
}
