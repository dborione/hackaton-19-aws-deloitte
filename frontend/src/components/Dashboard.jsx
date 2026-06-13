import React, { useCallback, useEffect, useState } from "react";
import config from "../config";
import { getProgressForGroup, getProgressForPage } from "./utils/progress";

import Identity, { questions as identityQuestions } from "./pages/personal-administrative/identity";
import CurrentHome, { questions as currentHomeQuestions } from "./pages/personal-administrative/currentHome";
import LifeStory, { questions as lifeStoryQuestions } from "./pages/personal-administrative/lifeStory";
import BodyAndOrganDonation, { questions as bodyAndOrganDonationQuestions } from "./pages/personal-administrative/bodyAndOrganDonation";
import Notes, { questions as notesQuestions } from "./pages/personal-administrative/notes";

import BurialChoice, { questions as burialChoiceQuestions } from "./pages/funeral-wishes/burialChoice";
import CremationChoice, { questions as cremationChoiceQuestions } from "./pages/funeral-wishes/cremationChoice";
import CeremonyType, { questions as ceremonyTypeQuestions } from "./pages/funeral-wishes/ceremonyType";
import CoffinAndUrn, { questions as coffinAndUrnQuestions } from "./pages/funeral-wishes/coffinAndUrn";
import FuneralCare, { questions as funeralCareQuestions } from "./pages/funeral-wishes/funeralCare";
import Viewing, { questions as viewingQuestions } from "./pages/funeral-wishes/viewing";
import PrintedMaterials, { questions as printedMaterialsQuestions } from "./pages/funeral-wishes/printedMaterials";
import Souvenirs, { questions as souvenirsQuestions } from "./pages/funeral-wishes/souvenirs";
import Flowers, { questions as flowersQuestions } from "./pages/funeral-wishes/flowers";
import SymbolicGestures, { questions as symbolicGesturesQuestions } from "./pages/funeral-wishes/symbolicGestures";
import Vehicles, { questions as vehiclesQuestions } from "./pages/funeral-wishes/vehicles";
import Staff, { questions as staffQuestions } from "./pages/funeral-wishes/staff";
import Music, { questions as musicQuestions } from "./pages/funeral-wishes/music";
import Texts, { questions as textsQuestions } from "./pages/funeral-wishes/texts";
import SlideshowReception, { questions as slideshowReceptionQuestions } from "./pages/funeral-wishes/slideshowReception";

import Financing, { questions as financingQuestions } from "./pages/financial-planning/financing";
import BankAgreement, { questions as bankAgreementQuestions } from "./pages/financial-planning/bankAgreement";
import Insurance, { questions as insuranceQuestions } from "./pages/financial-planning/insurance";
import SinglePayment, { questions as singlePaymentQuestions } from "./pages/financial-planning/singlePayment";

const styles = {
  nav: {
    background: "#232f3e",
    color: "#fff",
    padding: "16px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  main: {
    maxWidth: 900,
    margin: "32px auto",
    padding: "0 16px"
  },

  btn: {
    background: "#ff9900",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 4,
    cursor: "pointer"
  },

  header: {
    marginBottom: 24
  },

  title: {
    margin: "0 0 8px 0",
    fontSize: 28,
    color: "#232f3e"
  },

  subtitle: {
    margin: 0,
    color: "#555",
    lineHeight: 1.5
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16
  },

  card: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 20,
    cursor: "pointer"
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8
  },

  cardTitle: {
    margin: 0,
    fontSize: 22,
    color: "#232f3e"
  },

  cardDescription: {
    margin: 0,
    color: "#555",
    lineHeight: 1.5
  },

  progressBadge: {
    background: "#232f3e",
    color: "#fff",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 13,
    fontWeight: "bold",
    whiteSpace: "nowrap"
  },

  progressDetails: {
    marginTop: 10,
    fontSize: 13,
    color: "#666"
  },

  backBtn: {
    background: "transparent",
    color: "#232f3e",
    border: "1px solid #232f3e",
    padding: "8px 14px",
    borderRadius: 4,
    cursor: "pointer",
    marginBottom: 24
  },

  emptyBox: {
    background: "#fff",
    border: "1px dashed #aaa",
    borderRadius: 8,
    padding: 32,
    textAlign: "center",
    color: "#666"
  }
};

const pageComponents = {
  "identity": Identity,
  "current-home": CurrentHome,
  "life-story": LifeStory,
  "body-and-organ-donation": BodyAndOrganDonation,
  "notes": Notes,

  "burial-choice": BurialChoice,
  "cremation-choice": CremationChoice,
  "ceremony-type": CeremonyType,
  "coffin-and-urn": CoffinAndUrn,
  "funeral-care": FuneralCare,
  "viewing": Viewing,
  "printed-materials": PrintedMaterials,
  "souvenirs": Souvenirs,
  "flowers": Flowers,
  "symbolic-gestures": SymbolicGestures,
  "vehicles": Vehicles,
  "staff": Staff,
  "music": Music,
  "texts": Texts,
  "slideshow-reception": SlideshowReception,

  "financing": Financing,
  "bank-agreement": BankAgreement,
  "insurance": Insurance,
  "single-payment": SinglePayment
};

const pageQuestions = {
  "identity": identityQuestions,
  "current-home": currentHomeQuestions,
  "life-story": lifeStoryQuestions,
  "body-and-organ-donation": bodyAndOrganDonationQuestions,
  "notes": notesQuestions,

  "burial-choice": burialChoiceQuestions,
  "cremation-choice": cremationChoiceQuestions,
  "ceremony-type": ceremonyTypeQuestions,
  "coffin-and-urn": coffinAndUrnQuestions,
  "funeral-care": funeralCareQuestions,
  "viewing": viewingQuestions,
  "printed-materials": printedMaterialsQuestions,
  "souvenirs": souvenirsQuestions,
  "flowers": flowersQuestions,
  "symbolic-gestures": symbolicGesturesQuestions,
  "vehicles": vehiclesQuestions,
  "staff": staffQuestions,
  "music": musicQuestions,
  "texts": textsQuestions,
  "slideshow-reception": slideshowReceptionQuestions,

  "financing": financingQuestions,
  "bank-agreement": bankAgreementQuestions,
  "insurance": insuranceQuestions,
  "single-payment": singlePaymentQuestions
};

const dashboardCategories = [
  {
    id: "personal-administrative",
    title: "Personal and Administrative",
    description: "Identity, contact details, life story, donation choices and general notes.",
    subcategories: [
      {
        id: "identity",
        title: "Identity",
        description: "Civil status, names, birth information, national register number and emergency contacts."
      },
      {
        id: "current-home",
        title: "Current Home",
        description: "Current address, postal code, locality, phone number and email."
      },
      {
        id: "life-story",
        title: "Life Story",
        description: "Family history, professional path, distinctions, passions, life motto and memories."
      },
      {
        id: "body-and-organ-donation",
        title: "Body and Organ Donation",
        description: "Body donation to science, university information, document location and organ donation."
      },
      {
        id: "notes",
        title: "Notes",
        description: "Free notes and additional wishes."
      }
    ]
  },

  {
    id: "funeral-wishes",
    title: "Funeral Wishes",
    description: "Choices about burial, cremation, ceremony, coffin, urn, care, visits and personalization.",
    subcategories: [
      {
        id: "burial-choice",
        title: "Burial Choice",
        description: "Burial choice, cemetery, concession, vault and new concession wishes."
      },
      {
        id: "cremation-choice",
        title: "Cremation Choice",
        description: "Crematorium, destination of ashes, urn burial, scattering and ashes division."
      },
      {
        id: "ceremony-type",
        title: "Ceremony Type",
        description: "Civil or religious ceremony, place, privacy and clothing theme."
      },
      {
        id: "coffin-and-urn",
        title: "Coffin and Urn",
        description: "Coffin tint, shape, type, lining, decoration, philosophical signs and urn choice."
      },
      {
        id: "funeral-care",
        title: "Funeral Care",
        description: "Presentation care, conservation care, clothing and care preferences."
      },
      {
        id: "viewing",
        title: "Viewing",
        description: "Visits, objects in or on the coffin, presentation room decoration and viewing place."
      },
      {
        id: "printed-materials",
        title: "Printed Materials",
        description: "Necrology, announcement cards, online announcements, photos, obit and thanks."
      },
      {
        id: "souvenirs",
        title: "Souvenirs",
        description: "Cards, candles, biography, bookmarks, flower seeds, personalized bottle and tea."
      },
      {
        id: "flowers",
        title: "Flowers",
        description: "Floral compositions, preferred flowers, donations and no-flowers request."
      },
      {
        id: "symbolic-gestures",
        title: "Symbolic Gestures",
        description: "Religious rites, butterflies, origami, light rite, message box and tree planting."
      },
      {
        id: "vehicles",
        title: "Vehicles",
        description: "Hearse, funeral van, other vehicle and family choice."
      },
      {
        id: "staff",
        title: "Staff",
        description: "Master of ceremony, celebrant and coffin bearers."
      },
      {
        id: "music",
        title: "Music",
        description: "Musical accompaniment, choir, musicians, soloist or no music."
      },
      {
        id: "texts",
        title: "Texts",
        description: "Significant readings and final audio or video message."
      },
      {
        id: "slideshow-reception",
        title: "Slideshow and Reception",
        description: "Photo slideshow, personal recipe, favorite treats, reception place and reception choice."
      }
    ]
  },

  {
    id: "financial-planning",
    title: "Financial Planning",
    description: "Registration, bank agreement, insurance and single-payment preparation.",
    subcategories: [
      {
        id: "financing",
        title: "Financing",
        description: "Registration of last wishes and bank agreement for funeral costs."
      },
      {
        id: "bank-agreement",
        title: "Bank Agreement",
        description: "Bank and bank agreement reference."
      },
      {
        id: "insurance",
        title: "Insurance",
        description: "Funeral insurance, life insurance, company, policy number, broker and address."
      },
      {
        id: "single-payment",
        title: "Single Payment",
        description: "Single payment under conditions and amount/payment date."
      }
    ]
  }
];

export default function Dashboard({ token, onLogout }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [answersByPage, setAnswersByPage] = useState({});
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  const loadProgress = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoadingProgress(true);

    try {
      const res = await fetch(`${config.apiUrl}/data/answers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();

      console.log("ALL ANSWERS FOR PROGRESS:", data);

      setAnswersByPage(data.answersByPage || {});
    } catch (err) {
      console.error(err);
      setAnswersByPage({});
    }

    setIsLoadingProgress(false);
  }, [token]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  function openCategory(category) {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
  }

  function openSubcategory(subcategory) {
    setSelectedSubcategory(subcategory);
  }

  function goBack() {
    if (selectedSubcategory) {
      setSelectedSubcategory(null);
      loadProgress();
      return;
    }

    if (selectedCategory) {
      setSelectedCategory(null);
      loadProgress();
    }
  }

  function getSubcategoryProgress(subcategory) {
    return getProgressForPage(
      pageQuestions[subcategory.id] || [],
      answersByPage[subcategory.id] || {}
    );
  }

  function getCategoryProgress(category) {
    return getProgressForGroup(
      category.subcategories.map((subcategory) => ({
        questions: pageQuestions[subcategory.id] || [],
        answers: answersByPage[subcategory.id] || {}
      }))
    );
  }

  function renderProgress(progress) {
    return (
      <>
        <span style={styles.progressBadge}>
          {progress.percent}%
        </span>

        <p style={styles.progressDetails}>
          {progress.answered}/{progress.total}
        </p>
      </>
    );
  }

  const PageComponent = selectedSubcategory
    ? pageComponents[selectedSubcategory.id]
    : null;

  return (
    <>
      <nav style={styles.nav}>
        <span style={{ fontSize: 20, fontWeight: "bold" }}>
          Franchise App
        </span>

        <button style={styles.btn} onClick={onLogout}>
          Logout
        </button>
      </nav>

      <main style={styles.main}>
        {!selectedCategory && !selectedSubcategory && (
          <>
            <section style={styles.header}>
              <h1 style={styles.title}>Final Wishes Dashboard</h1>
              <p style={styles.subtitle}>
                Choose one of the three main sections to organize the funeral
                planning information.
              </p>
            </section>

            <section style={styles.grid}>
              {dashboardCategories.map((category) => {
                const progress = getCategoryProgress(category);

                return (
                  <article
                    key={category.id}
                    style={styles.card}
                    onClick={() => openCategory(category)}
                  >
                    <div style={styles.cardHeader}>
                      <h2 style={styles.cardTitle}>{category.title}</h2>
                      {renderProgress(progress)}
                    </div>

                    <p style={styles.cardDescription}>
                      {category.description}
                    </p>
                  </article>
                );
              })}
            </section>
          </>
        )}

        {selectedCategory && !selectedSubcategory && (
          <>
            <button style={styles.backBtn} onClick={goBack}>
              ← Back to dashboard
            </button>

            <section style={styles.header}>
              <h1 style={styles.title}>{selectedCategory.title}</h1>
              <p style={styles.subtitle}>
                {selectedCategory.description}
              </p>
            </section>

            <section style={styles.grid}>
              {selectedCategory.subcategories.map((subcategory) => {
                const progress = getSubcategoryProgress(subcategory);

                return (
                  <article
                    key={subcategory.id}
                    style={styles.card}
                    onClick={() => openSubcategory(subcategory)}
                  >
                    <div style={styles.cardHeader}>
                      <h2 style={styles.cardTitle}>{subcategory.title}</h2>
                      {renderProgress(progress)}
                    </div>

                    <p style={styles.cardDescription}>
                      {subcategory.description}
                    </p>
                  </article>
                );
              })}
            </section>
          </>
        )}

        {selectedCategory && selectedSubcategory && (
          <>
            <button style={styles.backBtn} onClick={goBack}>
              ← Back to {selectedCategory.title}
            </button>

            <section style={styles.header}>
              <h1 style={styles.title}>{selectedSubcategory.title}</h1>
              <p style={styles.subtitle}>
                {selectedSubcategory.description}
              </p>
            </section>

            <div style={styles.emptyBox}>
              {PageComponent ? (
                <PageComponent token={token} />
              ) : (
                <p>Page not found.</p>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
