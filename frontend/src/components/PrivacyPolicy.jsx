const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Politika e Privatësisë</h1>
          <p className="text-sm text-gray-500 mb-8">Përditësuar më: 9 Mars 2026</p>

          <div className="space-y-8 text-gray-700">
            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Të Dhënat që Mbledhim</h2>
              
              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Informacioni i Biznesit:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Emri i biznesit</li>
                <li>Email dhe numri i telefonit</li>
                <li>Adresa e biznesit</li>
                <li>Orari i punës</li>
              </ul>

              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Informacioni i Klientëve:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Emri i klientit</li>
                <li>Numri i telefonit</li>
                <li>Email (opsional)</li>
                <li>Detajet e rezervimit (data, ora)</li>
              </ul>

              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Të Dhëna Përdorimi:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Kohët e hyrjes në sistem</li>
                <li>Veçoritë e përdorura</li>
                <li>Adresa IP</li>
                <li>Lloji i shfletuesit</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Si i Përdorim të Dhënat</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Të ofrojmë shërbimin e rezervimeve</li>
                <li>Të dërgojmë njoftime (email dhe WhatsApp)</li>
                <li>Të përmirësojmë platformën</li>
                <li>Të ofrojmë mbështetje teknike</li>
                <li>Të parandalojmë mashtrimet dhe abuzimet</li>
                <li>Të përmbushim detyrimet ligjore</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Ndarja e të Dhënave</h2>
              <p className="mb-2">Ne ndajmë të dhënat tuaja vetëm me:</p>
              
              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Ofruesit e Shërbimeve:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Twilio:</strong> Për dërgimin e mesazheve WhatsApp</li>
                <li><strong>Gmail:</strong> Për dërgimin e emailave</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Siguria e të Dhënave</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Lidhje të enkriptuara (HTTPS/SSL)</li>
                <li>Serverë të sigurt me akses të kufizuar</li>
                <li>Backup-e të rregullta</li>
                <li>Fjalëkalime të enkriptuara</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Drejtat Tuaja</h2>
              <p className="mb-2">Ju keni të drejtë të:</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Aksesoni:</strong> Të shihni të gjitha të dhënat që kemi për ju</li>
                <li><strong>Korrigjoni:</strong> Të ndryshoni informacion të pasaktë</li>
                <li><strong>Fshini:</strong> Të kërkoni fshirjen e llogarisë dhe të dhënave</li>
                <li><strong>Eksportoni:</strong> Të shkarkoni të dhënat tuaja në format CSV</li>
                <li><strong>Kundërshtoni:</strong> Të refuzoni përpunimin për qëllime specifike</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Cookies dhe Teknologji të Ngjashme</h2>
              <p className="mb-2">Ne përdorim cookies vetëm për:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Të mbajmë sesionin tuaj të hyrjes</li>
                <li>Të ruajmë preferencat tuaja</li>
                <li>Të sigurojmë funksionalitetin e platformës</li>
              </ul>
              <p className="mt-4">
                Ne NUK përdorim cookies për gjurmim ose reklamim.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Ruajtja e të Dhënave</h2>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Llogari aktive:</strong> Të dhënat ruhen përgjithmonë</li>
                <li><strong>Llogari të fshira:</strong> Të dhënat fshihen pas 30 ditësh</li>
                <li><strong>Backup-et:</strong> Ruhen për 90 ditë</li>
                <li><strong>Logjet e sistemit:</strong> Ruhen për 12 muaj</li>
              </ul>
            </section>



            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Ndryshimet në Politikë</h2>
              <p>
                Ne mund të përditësojmë këtë politikë privatësie. Do t'ju njoftojmë me email për ndryshime të rëndësishme. 
                Data e përditësimit tregohet në krye të kësaj faqeje.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Transferimi Ndërkombëtar</h2>
              <p>
                Të dhënat tuaja mund të përpunohen në serverë jashtë Kosovës (p.sh., në BE ose SHBA). 
                Ne sigurojmë që këto transferime të jenë në përputhje me standardet e sigurisë.
              </p>
            </section>

            {/* Contact */}
            <section className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Kontakti për Privatësi</h2>
              <p className="mb-2">Për pyetje rreth privatësisë së të dhënave:</p>
              <ul className="space-y-1">
                <li>Email: privacy@reservo.com</li>
                <li>Telefon: +383 45 853 844</li>
                <li>Adresa: Gjilan, Kosovë</li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                Do të përgjigjemi në kërkesën tuaj brenda 48 orëve.
              </p>
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

export default PrivacyPolicy;
