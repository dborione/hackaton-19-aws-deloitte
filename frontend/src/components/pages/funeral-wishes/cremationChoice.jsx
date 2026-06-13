import QuestionPage from "../questionPage";

const cremationYes = { id: "wish_cremation", equals: "yes", category: "easy" };

export const questions = [
  { id: "wish_cremation", label: "I wish to be cremated", type: "yesno", category: "easy" },
  { id: "crematorium", label: "Crematorium:", showIf: cremationYes, category: "technical" },
  { id: "ashes_home_conservation", label: "Ashes kept at the home of:", type: "yesno", showIf: cremationYes, category: "easy" },
  { id: "ashes_home_conservation_person", label: "Ashes kept at the home of:", showIf: { id: "ashes_home_conservation", equals: "yes", category: "easy" }, category: "easy" },
  { id: "urn_burial", label: "Burial of the urn", type: "yesno", showIf: cremationYes, category: "easy" },
  { id: "columbarium_cemetery", label: "Columbarium at the cemetery of:", showIf: { id: "urn_burial", equals: "yes", category: "technical" }, category: "technical" },
  { id: "urn_field_cemetery", label: "Urn field at the cemetery of:", showIf: { id: "urn_burial", equals: "yes", category: "technical" }, category: "technical" },
  { id: "concession_vault_cemetery", label: "Concession / vault at the cemetery of:", showIf: { id: "urn_burial", equals: "yes", category: "technical" }, category: "technical" },
  { id: "concession_number", label: "Concession number:", showIf: { id: "urn_burial", equals: "yes", category: "technical" }, category: "technical" },
  { id: "plan_paid_ground_concession", label: "Plan the purchase of a paid ground concession", type: "yesno", showIf: cremationYes, category: "technical" },
  { id: "ashes_scattering", label: "Scattering of ashes", type: "yesno", showIf: cremationYes, category: "easy" },
  { id: "crematorium_scattering_lawn", label: "Scattering lawn at the crematorium", type: "yesno", showIf: { id: "ashes_scattering", equals: "yes", category: "technical" }, category: "technical" },
  { id: "cemetery_scattering_lawn", label: "Scattering lawn at the cemetery of:", showIf: { id: "ashes_scattering", equals: "yes", category: "technical" }, category: "technical" },
  { id: "sea_scattering_by_family", label: "Scattering by the family at sea from:", showIf: { id: "ashes_scattering", equals: "yes", category: "technical" }, category: "technical" },
  { id: "forest_of_memory_ceremony", label: "Ceremony in a remembrance forest:", showIf: cremationYes, category: "technical" },
  { id: "scattering_stick_option", label: "Option: scattering stick:", showIf: cremationYes, category: "technical" },
  { id: "other_ashes_destination", label: "Other ash destination:", showIf: cremationYes, category: "easy" },
  { id: "allow_ashes_division", label: "I authorize my family to divide my ashes for a keepsake, funeral jewelry, or several urns", type: "yesno", showIf: cremationYes, category: "easy" },
  { id: "refuse_ashes_division", label: "I refuse to have my ashes divided", type: "yesno", showIf: cremationYes, category: "easy" }
];

export default function CremationChoice({ token }) {
  return (
    <QuestionPage
      pageId="cremation-choice"
      title="Cremation | Destination of Ashes"
      questions={questions}
      token={token}
    />
  );
}
