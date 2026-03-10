const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kushtet e Shërbimit</h1>
          <p className="text-sm text-gray-500 mb-8">Përditësuar më: 9 Mars 2026</p>

          <div className="space-y-8 text-gray-700">
            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Përshkrimi i Shërbimit</h2>
              <p className="mb-2">
                Reservo është një platformë për menaxhimin e rezervimeve që u mundëson bizneseve në Kosovë të menaxhojnë rezervimet e tyre në mënyrë profesionale.
              </p>
              <p>
                Shërbimi përfshin: menaxhimin e rezervimeve, njoftime automatike me email dhe WhatsApp, dhe panel administrimi për pronarët e bizneseve.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Kushtet e Llogarisë</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Duhet të jeni 18 vjeç ose më i madh për të përdorur këtë shërbim</li>
                <li>Një llogari për biznes (nuk lejohen llogari të shumëfishta)</li>
                <li>Informacioni që jepni duhet të jetë i saktë dhe i përditësuar</li>
                <li>Ju jeni përgjegjës për sigurinë e llogarisë tuaj</li>
                <li>Mos ndani fjalëkalimin tuaj me të tjerë</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Kushtet e Pagesës</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Tarifa mujore: €25/muaj për biznes</li>
                <li>Pagesa kryhet në fillim të çdo muaji</li>
                <li>Nuk ka rimbursim për muajt e pjesshëm</li>
                <li>Nëse pagesa dështon, shërbimi pezullohet pas 7 ditëve</li>
                <li>Të dhënat tuaja ruhen për 30 ditë pas pezullimit</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Përdorimi i Pranueshëm</h2>
              <p className="mb-2">Ju nuk lejohet të:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Përdorni shërbimin për aktivitete të paligjshme</li>
                <li>Dërgoni spam ose mesazhe të padëshiruara</li>
                <li>Tentoni të hyni në llogari të tjera</li>
                <li>Kopjoni ose rishpërndani kodin tonë</li>
                <li>Mbingarkoni sistemin me kërkesa të tepërta</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Përgjegjësitë Tona</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Të ofrojmë shërbimin siç përshkruhet</li>
                <li>Të mbajmë sistemin funksional</li>
                <li>Të mbrojmë të dhënat tuaja</li>
                <li>Të përgjigjemi në pyetjet tuaja brenda 48 orëve</li>
                <li>Të njoftojmë për ndryshime të rëndësishme</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Ndërprerja e Shërbimit</h2>
              <p className="mb-2">
                Ju ose ne mund të ndërpresim shërbimin në çdo kohë me njoftim 30-ditor.
              </p>
              <p className="mb-2">Pas ndërprerjes:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Të dhënat tuaja ruhen për 30 ditë</li>
                <li>Mund të eksportoni të dhënat tuaja</li>
                <li>Pas 30 ditëve, të dhënat fshihen përfundimisht</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Kufizimi i Përgjegjësisë</h2>
              <p className="mb-2">
                Ne nuk jemi përgjegjës për:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Humbje të biznesit ose të ardhurave</li>
                <li>Probleme të shkaktuara nga përdoruesit tuaj</li>
                <li>Ndërprerje të shërbimeve të palëve të treta (Twilio, Gmail)</li>
              </ul>
              <p className="mt-2">
                Përgjegjësia jonë maksimale kufizohet në tarifën mujore të abonimit tuaj.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Ndryshimet në Kushte</h2>
              <p>
                Ne mund të përditësojmë këto kushte. Do t'ju njoftojmë me email 30 ditë para ndryshimeve. 
                Vazhdimi i përdorimit të shërbimit pas ndryshimeve do të thotë se i pranoni kushtet e reja.
              </p>
            </section>

            {/* Contact */}
            <section className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Kontakti</h2>
              <p className="mb-2">Për pyetje rreth këtyre kushteve:</p>
              <ul className="space-y-1">
                <li>Email: support@reservo.com</li>
                <li>Telefon: +383 45 853 844</li>
                <li>Adresa: Prishtinë, Kosovë</li>
              </ul>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          Reservo 2026
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
