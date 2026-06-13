import QuestionPage from "../questionPage";

const allowPrinted = { id: "no_printed_material", equals: "no" };

export const questions = [
  { id: "no_printed_material", label: "Je ne souhaite aucun imprimé, quel qu’il soit", type: "yesno" },
  { id: "family_chooses_printed_material", label: "Je laisse ma famille choisir", type: "yesno", showIf: allowPrinted },
  { id: "press_necrology", label: "Nécrologie dans la presse (texte à annexer)", type: "yesno", showIf: allowPrinted },
  { id: "newspapers_choice", label: "Choix du journal ou des journaux :", showIf: { id: "press_necrology", equals: "yes" } },
  { id: "announcement_card", label: "Faire-part (texte / photos à annexer)", type: "yesno", showIf: allowPrinted },
  { id: "digital_announcements", label: "Annonces digitales en ligne (site web, réseaux sociaux)", type: "yesno", showIf: allowPrinted },
  { id: "coffin_photo_enlargement", label: "Agrandissement photo sur le cercueil : (photo à annexer)", type: "yesno", showIf: allowPrinted },
  { id: "photo_formats", label: "Formats : A4 / A2 / A1 / A0 / Autres :", showIf: { id: "coffin_photo_enlargement", equals: "yes" } },
  { id: "photos_location", label: "La / les photo(s) se trouve(nt) :", showIf: { id: "coffin_photo_enlargement", equals: "yes" } },
  { id: "obiit", label: "Obiit (armoiries de famille)", type: "yesno", showIf: allowPrinted },
  { id: "funeral_board", label: "Tableau funéraire (pêle-mêle, chevalet, œuvre…)", type: "yesno", showIf: allowPrinted },
  { id: "thanks", label: "Remerciements (texte / photos à annexer)", type: "yesno", showIf: allowPrinted },
  { id: "printed_other", label: "Autre :", showIf: allowPrinted }
];

export default function PrintedMaterials({ token }) {
  return (
    <QuestionPage
      pageId="printed-materials"
      title="Imprimés"
      questions={questions}
      token={token}
    />
  );
}
