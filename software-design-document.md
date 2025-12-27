# **Software Design Document: Arazzo Workflow Builder**

## **1\. Einleitung**

Dieses Dokument beschreibt das Design für eine Web-Applikation zur visuellen Erstellung und Bearbeitung von **OpenAPI Arazzo** Workflows. Die Anwendung ermöglicht es, komplexe API-Sequenzen visuell zu modellieren und als standardisierte YAML-Spezifikation zu exportieren. Der Fokus liegt auf einer kontextsensitiven Benutzerführung.

## **2\. Systemarchitektur**

### **2.1 Frontend-Architektur**

Die Applikation wird als moderne Single-Page Application (SPA) realisiert.

* **Framework:** **Vue.js 3** (Composition API mit \<script setup\>).  
* **Sprache:** **TypeScript** (Strict Mode) für maximale Typsicherheit der Spezifikations-Modelle.  
* **Node-Engine:** **Rete.js v2**. Diese Engine ermöglicht die Trennung von Datenlogik (Editor) und Rendering (Vue-Plugin).  
* **Styling:** **Tailwind CSS** für das Interface.  
* **State Management:** **Pinia** zur Verwaltung globaler Zustände.

### **2.2 Architektur-Entscheidungen & Trade-Offs**

| Faktor | Entscheidung | Trade-Off / Risiko |
| :---- | :---- | :---- |
| **Framework** | **Vue.js 3** | **Ökosystem-Größe:** Im Vergleich zu React ist die Auswahl an vorgefertigten Node-UI-Komponenten kleiner. Wir müssen mehr Custom-Logik für Rete.js-Integration schreiben. |
| **Node Engine** | **Rete.js v2** | **Lernkurve:** Rete.js v2 ist mächtiger als React Flow, aber auch komplexer in der Initialisierung (Plugins, Sockets, Data-Flow-Engine). |
| **Sprache** | **TypeScript** | **Initialer Overhead:** Die Definition der komplexen Arazzo-Typen (Nested Objects, JSON-Pfade) erfordert mehr Zeit beim Setup, reduziert aber Laufzeitfehler drastisch. |
| **Rendering** | **Vue-Render-Plugin** | **Abhängigkeit:** Wir sind auf die Kompatibilität des Rete-Vue-Plugins angewiesen. Bei Major-Updates von Vue kann es hier zu Verzögerungen kommen. |

### **2.3 Warum nicht React oder Vanilla TS?**

* **Gegen React:** Reacts "One-Way Data Flow" beißt sich oft mit der imperativen Natur von Graph-Engines. Rete.js integriert sich durch seine Plugin-Struktur sehr organisch in Vues reaktives System (Proxy-basiert).  
* **Gegen Vanilla TS:** Die Komplexität des Property-Panels (Formularvalidierung, dynamische Inputs basierend auf OpenAPI) wäre ohne ein Framework wie Vue extrem wartungsintensiv.

## **3\. Technisches Datenmodell (TypeScript)**

interface ArazzoStep {  
  stepId: string;  
  operationId: string;  
  description?: string;  
  parameters?: ArazzoParameter\[\];  
  successCriteria?: string\[\];  
  onSuccess?: ArazzoCriterionTarget\[\];  
  onFailure?: ArazzoCriterionTarget\[\];  
}

## **4\. Rete.js Integration & Kontextuelle Logik**

Anstatt einer statischen Komponenten-Bibliothek wird ein **kontextsensitiver Erstellungs-Flow** implementiert:

1. **Context-Menu Plugin:** Beim Rechtsklick auf den Canvas oder beim Ziehen einer Verbindung in den leeren Raum öffnet sich ein Menü.  
2. **Socket-Filtering:** Rete.js prüft den Typ des Ausgangs-Sockets. Wenn von einem onSuccess-Port gezogen wird, schlägt das System automatisch neue Steps oder End-Knoten vor.  
3. **Parent-Child Relation:** Knoten können Unterknoten (z.B. für komplexe inputs oder assertions) direkt über Inline-Buttons am Knoten selbst erzeugen.

## **5\. UI/UX Design Komponenten**

1. **Workflow Canvas:** Hauptbereich (Rete.js).  
2. **Contextual Creator:** Ein dynamisches Popup-Menü, das basierend auf dem aktuellen Fokus (z.B. selektierter Node oder gezogene Verbindung) relevante Arazzo-Bausteine anbietet.  
3. **Contextual Inspector:** Rechtes Panel für detaillierte Attribut-Bearbeitung des selektierten Nodes.  
4. **Source Manager:** Verwaltung der referenzierten OpenAPI-Dokumente.

## **6\. Implementierungs-Roadmap**

### **Phase 1: Core & Context Logic**

* Setup Vue 3 \+ Vite \+ TS \+ Rete.js.  
* Implementierung des **Context-Menu Plugins** für Rete.js.  
* Entwicklung der Logik für "Action-Triggered Node Creation".

### **Phase 2: Arazzo Validation & YAML**

* Mapping der visuellen Verbindungen auf onSuccess/onFailure Pfade.  
* YAML-Export Logik.

### **Phase 3: Smart Suggestions**

* Vorschlagen von operationIds basierend auf dem Kontext des vorherigen Schrittes.
