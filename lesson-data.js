// Lesson data extracted from index.html
// This file defines `defaultLessonData` as a global used by the page's main script.
const defaultLessonData = {
  vocabData: [
  { la:"exercitus", de:["Heer"], wt:"Nomen", badge:"wt-n", stf:"exercitus, m.", hint:"Exercieren", icon:"shield" },
  { la:"traducere", de:["hinüberführen (über)"], wt:"Verb", badge:"wt-v", stf:"traducō, traduxi, traductum", hint:"trans + ducere", icon:"arrow-right" },
  { la:"puer novem annorum", de:["ein neunjähriger Junge"], wt:"Nomen", badge:"wt-n", stf:"—", hint:"Hannibals Alter", icon:"child" },
  { la:"domi", de:["zu Hause"], wt:"Adverb", badge:"wt-adv", stf:"—", hint:"Am Ort des Hauses", icon:"home" },
  { la:"nolle", de:["nicht wollen"], wt:"Verb", badge:"wt-v", stf:"nolo, nolui", hint:"schnollen", icon:"x-circle" },
  { la:"malle", de:["lieber wollen"], wt:"Verb", badge:"wt-v", stf:"malo, malui", hint:"lieber in Malle", icon:"heart" },
  { la:"sinere", de:["lassen","erlauben"], wt:"Verb", badge:"wt-v", stf:"sino, sivi, situm", hint:"Zulassung geben/since", icon:"hand-open" },
  { la:"sacra facere", de:["opfern"], wt:"Verb", badge:"wt-v", stf:"—", hint:"Religiöse Handlung", icon:"flame" },
  { la:"cogitare", de:["beabsichtigen","denken"], wt:"Verb", badge:"wt-v", stf:"cogito", hint:"Gedanklich planen / Cogito ergo sum", icon:"brain" },
  { la:"severus", de:["streng"], wt:"Adjektiv", badge:"wt-a", stf:"a, um", hint:"Snape", icon:"frown" },
  { la:"iurare", de:["schwören"], wt:"Verb", badge:"wt-v", stf:"iuro", hint:"Eid ablegen", icon:"hand-raised" },
  { la:"iusiurandum", de:["Eid","Schwur"], wt:"Nomen", badge:"wt-n", stf:"iusiurandi, n.", hint:"Bindender Eid", icon:"scroll" },
  { la:"repetere", de:["wiederholen","(zurück)verlangen"], wt:"Verb", badge:"wt-v", stf:"repeto, repetivi, repetitum", hint:"re + petere", icon:"rotate-cw" },
  { la:"odium", de:["Hass"], wt:"Nomen", badge:"wt-n", stf:"odii, n.", hint:"Gefühl der Verachtung", icon:"angry" },
  { la:"idem...qui", de:["derselbe/dergleiche ... wie"], wt:"Pronomen", badge:"wt-pron", stf:"—", hint:"Identität ausdrücken", icon:"repeat" },
  { la:"umquam", de:["jemals"], wt:"Adverb", badge:"wt-adv", stf:"—", hint:"vergleiche: numquam", icon:"clock" },
  { la:"convertere", de:["verändern","verwandeln", "(um)wandeln"], wt:"Verb", badge:"wt-v", stf:"converti, conversum", hint:"con + vertere", icon:"refresh-cw" },
  { la:"Carthaginiensis, Carthagiense", de:["karthagisch","Karthager"], wt:"Adjektiv/Nomen", badge:"wt-a", stf:"—", hint:"Aus Karthago", icon:"flag" },
  { la:"Carthago", de:["Karthago"], wt:"Nomen", badge:"wt-n", stf:"Carthaginis, f.", hint:"Stadt in Nordafrika", icon:"map-pin" },
  { la:"Hamilcar", de:["Hamilkar"], wt:"Nomen", badge:"wt-n", stf:"Hamilcaris, m.", hint:"Vater Hannibals", icon:"user" },
  { la:"Hannibal", de:["Hannibal"], wt:"Nomen", badge:"wt-n", stf:"Hannibalis, m.", hint:"Feldherr der Karthager", icon:"crown" },
  { la:"Hispania", de:["Spanien"], wt:"Nomen", badge:"wt-n", stf:"Hispaniae, f.", hint:"Iberische Halbinsel", icon:"map" },
  ],

  // Kontext-Mapping: Lateinisches Kontext-Stück und seine Übersetzung
  contextMap: [
    { la: 'Hamilcar', context: 'Hamilcar pater Hannibalis', translation: 'Hamilkar, Vater des Hannibal' },
    { la: 'imperator', context: 'imperator Carthaginiensium', translation: 'Befehlshaber der Karthager' },
    { la: 'erat', context: 'imperator erat', translation: 'war Befehlshaber' },
    { la: 'exercitus', context: 'magnum exercitum', translation: 'großes Heer' },
    { la: 'traducere', context: 'in Hispaniam traducere', translation: 'nach Spanien führen' },
    { la: 'volebat', context: 'traducere volebat', translation: 'wollte führen' },
    { la: 'puer', context: 'puer novem annorum', translation: 'Junge von neun Jahren' },
    { la: 'domi', context: 'domi manere', translation: 'zu Hause bleiben' },
    { la: 'nolle', context: 'domi manere noluit', translation: 'er wollte nicht zuhause bleiben' },
    { la: 'interrogare', context: 'patrem interrogavit', translation: 'befragte seinen Vater' },
    { la: 'malle', context: 'in castris esse malo', translation: 'lieber im Lager sein' },
    { la: 'comes', context: 'comes tuus', translation: 'dein Gefährte' },
    { la: 'malebam', context: 'in castris esse malo', translation: 'ich will lieber im Lager sein' },
    { la: 'relinquere', context: 'nolite me relinquere in patria', translation: 'lasst mich nicht im Vaterland zurück' }
  ]
};