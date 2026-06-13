import QuestionPage from "../questionPage";

const chooseDetails = { id: "let_relatives_choose", equals: "no" };
const chooseUrn = { id: "let_relatives_choose_urn", equals: "no" };

const questions = [
  { id: "let_relatives_choose", label: "Je laisse mes proches choisir", type: "yesno" },
  { id: "coffin_tint_light", label: "Claire", type: "yesno", showIf: chooseDetails },
  { id: "coffin_tint_dark", label: "Foncée", type: "yesno", showIf: chooseDetails },
  { id: "coffin_tint_white", label: "Blanche", type: "yesno", showIf: chooseDetails },
  { id: "coffin_tint_other", label: "Autre :", showIf: chooseDetails },
  { id: "coffin_shape_traditional", label: "Traditionnelle", type: "yesno", showIf: chooseDetails },
  { id: "coffin_shape_modern", label: "Moderne", type: "yesno", showIf: chooseDetails },
  { id: "coffin_shape_other", label: "Autre :", showIf: chooseDetails },
  { id: "coffin_type_pefc", label: "Bois massif certifié PEFC", type: "yesno", showIf: chooseDetails },
  { id: "coffin_type_mdf", label: "Simple (MDF)", type: "yesno", showIf: chooseDetails },
  { id: "coffin_type_other", label: "Autre :", showIf: chooseDetails },
  { id: "coffin_lining", label: "Capiton (avec ou sans dentelle, satiné, en coton, en lin, coloré,…) :", type: "textarea", showIf: chooseDetails },
  { id: "coffin_cover_floral", label: "Composition florale", type: "yesno", showIf: chooseDetails },
  { id: "coffin_cover_other", label: "Autre :", showIf: chooseDetails },
  { id: "philosophical_religious_symbol", label: "Symbole religieux (préciser lequel) :", showIf: chooseDetails },
  { id: "philosophical_flag", label: "Drapeau (préciser lequel) :", showIf: chooseDetails },
  { id: "philosophical_other", label: "Autre :", showIf: chooseDetails },
  { id: "let_relatives_choose_urn", label: "Je laisse mes proches choisir l’urne.", type: "yesno", showIf: chooseDetails },
  { id: "urn_pefc", label: "Bois massif certifié PEFC", type: "yesno", showIf: [chooseDetails, chooseUrn] },
  { id: "urn_biodegradable", label: "Biodégradable", type: "yesno", showIf: [chooseDetails, chooseUrn] },
  { id: "urn_porcelain_ceramic", label: "Porcelaine / Céramique", type: "yesno", showIf: [chooseDetails, chooseUrn] },
  { id: "urn_metallic", label: "Métallique", type: "yesno", showIf: [chooseDetails, chooseUrn] },
  { id: "urn_other", label: "Autre :", showIf: [chooseDetails, chooseUrn] },
  { id: "personalization_other_wishes", label: "Personnalisation et autres souhaits : (Linceul, décoration, personnalisation, lettrage sur cercueil, gravure, fresque à la bombe de peinture, contour fleuri...)", type: "textarea", showIf: chooseDetails }
];

export default function CoffinAndUrn({ token }) {
  return (
    <QuestionPage
      pageId="coffin-and-urn"
      title="Choix du cercueil et/ou de l’urne"
      questions={questions}
      token={token}
    />
  );
}
