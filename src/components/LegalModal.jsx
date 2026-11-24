import { useEffect, useRef } from 'react';

// Impressum and Datenschutz as a dialog over the map, opened from the map's attribution ("i")
// or the panel footer via #impressum / #datenschutz, so both can also be linked directly.
const LEGAL_TABS = [
    { id: 'impressum', label: 'Impressum' },
    { id: 'datenschutz', label: 'Datenschutz' },
];

const Impressum = () => (
    <>
        <h3>Anbieter und Kontakt</h3>
        <address>
            <strong>Kirill Lisochenko</strong>
            <span>Hauptstr. 12</span>
            <span>89438 Holzheim</span>
            <span>Bayern, Deutschland</span>
            <a href="mailto:k.lisochenko@web.de">k.lisochenko@web.de</a>
        </address>
        <p>„Bayern auf einen Blick“ ist eine interaktive Karte aus dem persönlichen beruflichen Portfolio <a href="https://gis.krmn.app/" target="_blank" rel="noopener noreferrer">Karten &amp; Code</a> von Kirill Lisochenko.</p>
        <p>Anbieterangaben gemäß <a href="https://www.gesetze-bayern.de/Content/Document/MStV-18" target="_blank" rel="noopener noreferrer">§ 18 Abs. 1 Medienstaatsvertrag</a>.</p>
        <h3>Daten und Kartengrundlagen</h3>
        <p>Bevölkerungs- und Flächenangaben: Statistisches Bundesamt (Destatis), Gemeindeverzeichnis GV-ISys, Stand 31.12.2025, Basis Zensus 2022; Bayerisches Landesamt für Statistik. Grundkarte: © <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>, Kartendaten © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>-Mitwirkende. Symbol der Seite: <a href="https://icons8.com/" target="_blank" rel="noopener noreferrer">Icons8</a>.</p>
    </>
);

const Datenschutz = () => (
    <>
        <h3>1. Verantwortlicher</h3>
        <p>Verantwortlich für diese Anwendung ist Kirill Lisochenko (Anschrift und E-Mail siehe <a href="#impressum">Impressum</a>).</p>
        <h3>2. Was die Anwendung verarbeitet</h3>
        <p>Die Karte kann ohne Registrierung genutzt werden. Sie enthält keine Besuchsanalyse, keine Werbetracker und kein Kontaktformular. Die Anwendung setzt keine Cookies und speichert nichts im Local Storage oder Session Storage des Browsers.</p>
        <p>Die gewählte Ansicht (Regierungsbezirk, Kreis, Gemeinde) steht im Adressteil nach dem „#“ der Seite, damit sich eine Ansicht als Lesezeichen speichern oder als Link teilen lässt. Dieser Teil der Adresse wird nicht an den Server übertragen. Er kann aber im Browserverlauf stehen und wird beim Teilen eines Links weitergegeben.</p>
        <h3>3. Hosting mit GitHub Pages</h3>
        <p>Die Anwendung und ihre Datendateien werden über GitHub Pages ausgeliefert. GitHub nennt als Datenschutzkontakte GitHub, Inc., 88 Colin P. Kelly Jr. St., San Francisco, CA 94107, USA, und GitHub B.V., Prins Bernhardplein 200, 1097 JB Amsterdam, Niederlande (<a href="mailto:dpo@github.com">dpo@github.com</a>).</p>
        <p>Beim Aufruf erhält GitHub technische Verbindungsdaten, darunter die IP-Adresse. Für Pages bestätigt GitHub die Protokollierung von IP-Adressen zur Sicherheit. GitHub beschreibt Verarbeitung auch in den USA sowie Standardvertragsklauseln und das EU-U.S. Data Privacy Framework als Transfermechanismen; eine feste Speicherdauer speziell für Pages-Protokolle wird dort nicht genannt.</p>
        <p><a href="https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection" target="_blank" rel="noopener noreferrer">GitHub Pages: Datenerhebung</a> · <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">Datenschutzerklärung von GitHub</a></p>
        <h3>4. Grundkarte von CARTO</h3>
        <p>Die Hintergrundkarte (Kartenstil, Kacheln, Schriften und Symbole) wird beim Anzeigen direkt von Servern von CARTO (basemaps.cartocdn.com) geladen. CARTO erhält dabei die IP-Adresse und technische Anfragedaten; die angeforderten Kacheln lassen den betrachteten Kartenausschnitt erkennen. Ohne diese Verbindung kann die Hintergrundkarte nicht angezeigt werden. Weitere Angaben: <a href="https://carto.com/privacy" target="_blank" rel="noopener noreferrer">Datenschutzhinweise von CARTO</a>.</p>
        <h3>5. Rechtsgrundlage</h3>
        <p>Die technische Bereitstellung und die Einbindung der Hintergrundkarte dienen meinem berechtigten Interesse an einer erreichbaren, sicheren und funktionsfähigen Darstellung dieser Karte (Art. 6 Abs. 1 Buchst. f DSGVO).</p>
        <h3>6. Ihre Rechte</h3>
        <p>Unter den jeweiligen gesetzlichen Voraussetzungen haben Sie Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit. Gegen eine Verarbeitung auf Grundlage berechtigter Interessen können Sie aus Gründen Ihrer besonderen Situation Widerspruch einlegen. Für Anliegen zu dieser Anwendung erreichen Sie mich unter <a href="mailto:k.lisochenko@web.de">k.lisochenko@web.de</a>.</p>
        <h3>7. Beschwerde und Datenschutzaufsicht</h3>
        <p>Wenn Sie eine Verletzung Ihrer Datenschutzrechte vermuten, können Sie sich an eine Datenschutzaufsichtsbehörde wenden, insbesondere an Ihrem gewöhnlichen Aufenthaltsort, Arbeitsplatz oder am Ort des vermuteten Verstoßes. Für nichtöffentliche Stellen in Bayern ist das Bayerische Landesamt für Datenschutzaufsicht (BayLDA) zuständig: <a href="https://www.lda.bayern.de/de/beschwerde.html" target="_blank" rel="noopener noreferrer">Beschwerde einreichen</a> · <a href="https://www.lda.bayern.de/de/kontakt.html" target="_blank" rel="noopener noreferrer">Kontakt</a>.</p>
        <p>Allgemeine Hinweise zum Portfolio: <a href="https://gis.krmn.app/datenschutz/" target="_blank" rel="noopener noreferrer">Datenschutzerklärung von Karten &amp; Code</a>.</p>
    </>
);

const LegalModal = ({ tab, onTab, onClose }) => {
    const dialogRef = useRef(null);
    const bodyRef = useRef(null);
    useEffect(() => { dialogRef.current?.focus(); }, []);
    useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = 0; }, [tab]);

    return (
        <div className="legal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="legal-dialog" role="dialog" aria-modal="true" aria-labelledby="legal-title" tabIndex={-1} ref={dialogRef}>
                <header className="legal-head">
                    <div>
                        <h2 id="legal-title" className="sr-only">Rechtliche Hinweise</h2>
                        <div className="legal-tabs" role="tablist">
                            {LEGAL_TABS.map(t => (
                                <button
                                    key={t.id}
                                    role="tab"
                                    aria-selected={tab === t.id}
                                    className={tab === t.id ? 'active' : ''}
                                    onClick={() => onTab(t.id)}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                        <p className="legal-stand">Bayern auf einen Blick · Stand: 24. November 2026</p>
                    </div>
                    <button className="legal-close" onClick={onClose} aria-label="Schließen">×</button>
                </header>
                <div className="legal-body" role="tabpanel" ref={bodyRef}>
                    {tab === 'impressum' ? <Impressum /> : <Datenschutz />}
                </div>
            </div>
        </div>
    );
};

export default LegalModal;
