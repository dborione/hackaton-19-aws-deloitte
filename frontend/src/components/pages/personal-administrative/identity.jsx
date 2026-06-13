import QuestionPage from "../questionPage";

export const questions = [
  { id: "cover_full_name", label: "Full name:", category: "easy" },
  { id: "civility", label: "Title / form of address:", category: "easy" },
  { id: "first_names", label: "First name(s):", category: "easy" },
  { id: "birth_name", label: "Birth name:", category: "technical" },
  { id: "usual_name_or_nickname", label: "Usual name / nickname:", category: "easy" },
  { id: "birth_date", label: "Date of birth (DD / MM / YYYY):", category: "technical" },
  { id: "birth_place", label: "Place of birth (city / country):", category: "technical" },
  { id: "national_register_number", label: "National register number:", category: "technical" },
  { id: "contacts_in_case_of_death", label: "Relative(s) to contact in case of death:", category: "technical" }
];

export default function Identity({ token }) {
  return (
    <QuestionPage
      pageId="identity"
      title="Who Am I?"
      questions={questions}
      token={token}
    />
  );
}
