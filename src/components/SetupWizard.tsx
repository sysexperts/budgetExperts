import React, { useState } from 'react';
import { Home, Users, CheckCircle, ArrowRight } from 'lucide-react';

interface SetupWizardProps {
  onComplete: () => void;
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [householdName, setHouseholdName] = useState('');
  const [householdDescription, setHouseholdDescription] = useState('');
  const [householdId, setHouseholdId] = useState<number | null>(null);
  const [members, setMembers] = useState<Array<{ name: string; role: string }>>([]);
  const [currentMemberName, setCurrentMemberName] = useState('');
  const [currentMemberRole, setCurrentMemberRole] = useState('');

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/households', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: householdName, description: householdDescription }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setHouseholdId(data.id);
        setStep(2);
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Haushalts:', error);
      alert('Fehler beim Erstellen des Haushalts');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMemberName.trim()) return;

    try {
      const response = await fetch('/api/family-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: currentMemberName, 
          role: currentMemberRole || undefined,
          householdId 
        }),
      });
      
      if (response.ok) {
        setMembers([...members, { name: currentMemberName, role: currentMemberRole }]);
        setCurrentMemberName('');
        setCurrentMemberRole('');
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Mitglieds:', error);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('setupCompleted', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
          <h1 className="text-3xl font-bold mb-2">Willkommen beim Budget Planer! 🎉</h1>
          <p className="text-blue-100">Lass uns gemeinsam deinen Haushalt einrichten</p>
        </div>

        {/* Progress Bar */}
        <div className="px-8 pt-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {step > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
              </div>
              <div className={`h-1 w-24 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            </div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {step > 2 ? <CheckCircle className="w-6 h-6" /> : '2'}
              </div>
              <div className={`h-1 w-24 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {step > 3 ? <CheckCircle className="w-6 h-6" /> : '3'}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Home className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Haushalt erstellen</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Erstelle zuerst deinen Haushalt. Du kannst später weitere Haushalte hinzufügen.
              </p>
              <form onSubmit={handleCreateHousehold} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Haushaltsname *
                  </label>
                  <input
                    type="text"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="z.B. Haupthaushalt, Familie Müller"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beschreibung (optional)
                  </label>
                  <input
                    type="text"
                    value={householdDescription}
                    onChange={(e) => setHouseholdDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="z.B. Unser gemeinsamer Haushalt"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  Weiter <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Familienmitglieder hinzufügen</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Füge die Mitglieder deines Haushalts hinzu. Du kannst später weitere hinzufügen oder überspringen.
              </p>
              
              {members.length > 0 && (
                <div className="mb-6 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Hinzugefügte Mitglieder:</p>
                  {members.map((member, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-800">{member.name}</span>
                      {member.role && <span className="text-sm text-gray-600">({member.role})</span>}
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddMember} className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={currentMemberName}
                      onChange={(e) => setCurrentMemberName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="z.B. Max"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rolle (optional)
                    </label>
                    <input
                      type="text"
                      value={currentMemberRole}
                      onChange={(e) => setCurrentMemberRole(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="z.B. Vater"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Mitglied hinzufügen
                </button>
              </form>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Überspringen
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={members.length === 0}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                >
                  Weiter <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Perfekt! Du bist startklar! 🎉</h2>
              <p className="text-gray-600 mb-8">
                Dein Haushalt wurde erfolgreich eingerichtet. Jetzt kannst du beginnen, deine Finanzen zu verwalten.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-800 mb-3">📚 Schnellstart-Tipps:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Kategorien:</strong> Verwalte deine Ausgabenkategorien im Tab "Kategorien"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Fixkosten:</strong> Füge wiederkehrende Kosten wie Miete hinzu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Abonnements:</strong> Verwalte alle deine Abos an einem Ort</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Statistik:</strong> Behalte den Überblick mit grafischen Auswertungen</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleFinish}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-bold text-lg shadow-lg"
              >
                Los geht's! 🚀
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
