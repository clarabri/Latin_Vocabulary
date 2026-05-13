# Latein Vokabeltrainer

Ein browserbasierter Vokabel- und Grammatiktrainer für den Lateinunterricht, ohne Build-Schritt oder externe Abhängigkeiten – reines HTML, CSS und JavaScript.

---

## Inhalt

Der Trainer deckt zwei Kursgruppen ab:

### Latein-9c
| Bereich | Lektionen / Themen |
|---|---|
| Grammatik | velle, nolle, malle – Formenübung |
| Grammatik | ire – Formen & Komposita |
| Vokabeln | Lektion 15, 40, 41, 42, 43 |

### Latein-8c
| Bereich | Lektionen / Themen |
|---|---|
| Vokabeln | Stammformen bekannter Vokabeln |
| Vokabeln | Lektion 18 |

---

## Projektstruktur

```
Latin_Vocabulary/
├── index.html                  # Startseite mit Kursauswahl-Menü
├── style.css                   # Globales Stylesheet (CSS-Variablen, Layout, Komponenten)
├── script.js                   # Hauptlogik: Quiz-Engine, Tab-Steuerung, Fuzzy-Matching
│
├── lesson-data.js              # Vokabeldaten Lektion 41 (9c, Standardlektion)
├── lesson-data-9c-L15.js       # Vokabeldaten Lektion 15 (9c)
├── lesson-data-9c-L40.js       # Vokabeldaten Lektion 40 (9c)
├── lesson-data-8c.js           # Vokabeldaten Stammformen (8c)
├── lesson-data-8c-L18.js       # Vokabeldaten Lektion 18 (8c)
│
└── lessons/
    ├── quiz.html               # Quiz-Shell für Lektion 41 (9c)
    ├── quiz-9c-L15.html        # Quiz-Shell für Lektion 15 (9c)
    ├── quiz-9c-L40.html        # Quiz-Shell für Lektion 40 (9c)
    ├── quiz-8c.html            # Quiz-Shell für Stammformen (8c)
    ├── quiz-8c-L18.html        # Quiz-Shell für Lektion 18 (8c)
    ├── verben-irregularia.html # Grammatikseite: velle / nolle / malle
    └── verb-ire.html           # Grammatikseite: ire & Komposita
```

---

## Funktionen

### Vokabelquiz (drei Tabs)

**Tab I – Deutsch**
Lateinisches Wort wird angezeigt, deutsche Bedeutung muss eingetippt werden. Unterstützt mehrere akzeptierte Bedeutungen (kommagetrennt). Fortschrittsbalken, Streak-Zähler, Auswertung am Ende.

**Tab II – Stammformen**
Abfrage der lateinischen Stammformen (Infinitiv, Perfekt, Supinum). Normalisierung ignoriert Makrons (ā → a) und Zeichensetzung, sodass Tippvarianten toleriert werden.

**Tab III – Karteikarten**
Klassische Flashcard-Ansicht: Karte umdrehen, selbst bewerten (gewusst / nicht gewusst).

### Fuzzy-Matching
Antworten werden mit Levenshtein-Distanz verglichen: bei kurzen Wörtern (< 8 Zeichen) wird 1 Tippfehler toleriert, bei längeren 2. Klammerinhalte wie `(über)` sind optional.

### Grammatikseiten
Eigenständige Seiten (kein Quiz-Format) mit Konjugationstabellen und interaktiven Übungen für unregelmäßige Verben:
- `verben-irregularia.html`: *velle*, *nolle*, *malle* mit Tab-Navigation pro Verb
- `verb-ire.html`: *ire* und seine Komposita (*abire*, *redire* etc.)

### Eselsbrücken
Jede Vokabel kann eine `hint`-Eigenschaft tragen (z. B. „Snape" für *severus*), die im Quiz als Gedächtnisstütze eingeblendet wird.

---

## Datenformat

Jede Lektion wird in einer eigenen `lesson-data-*.js`-Datei als `defaultLessonData`-Objekt definiert:

```js
const defaultLessonData = {
  vocabData: [
    {
      la: "exercitus",          // Lateinisches Wort
      de: ["Heer"],             // Deutsche Bedeutung(en) – Array
      wt: "Nomen",             // Wortart
      badge: "wt-n",           // CSS-Badge-Klasse
      stf: "exercitus, m.",    // Stammform / Genitiv
      hint: "Exercieren",      // Eselsbrücke
      icon: "shield"           // Icon-Name (Lucide-kompatibel)
    },
    // ...
  ],
  contextMap: [ ... ],         // Kontext-Satz-Mapping (Lat → De)
  // weitere optionale Felder: trChips, sentenceBlanks, ...
};
```

---

## Starten

Da das Projekt kein Build-System verwendet, genügt es, `index.html` in einem Browser zu öffnen – oder über einen lokalen Webserver zu servieren (z. B. `npx serve .`).

---

## Design

- **Fonts:** Playfair Display (Überschriften), Source Serif 4 (Fließtext), DM Mono (Labels/Badges)
- **Farbpalette:** warmes Pergament-Beige als Hintergrund (`#f7f3ec`), Dunkelbraun als Hauptfarbe, Gold für Akzente
- **Kein Framework**, kein Build-Schritt – alle Abhängigkeiten sind Google Fonts via CDN
