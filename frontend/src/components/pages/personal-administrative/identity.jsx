import QuestionPage from "../questionPage";

export const questions = [
  { id: "cover_full_name", label: "Nom prénom :" },
  { id: "civility", label: "Ma civilité :" },
  { id: "first_names", label: "Mon / Mes prénom(s) :" },
  { id: "birth_name", label: "Mon nom de naissance :" },
  { id: "usual_name_or_nickname", label: "Mon nom d’usage / Mon surnom :" },
  { id: "birth_date", label: "Ma date de naissance (JJ / MM / AAAA) :" },
  { id: "birth_place", label: "Mon lieu de naissance (Localité / Pays) :" },
  { id: "national_register_number", label: "Mon n° de registre national :" },
  { id: "contacts_in_case_of_death", label: "Mon / Mes proche(s) à contacter en cas de décès :" }
];

export default function Identity({ token }) {
  return (
    <QuestionPage
      pageId="identity"
      title="Qui suis-je ?"
      questions={questions}
      token={token}
    />
  );
}
