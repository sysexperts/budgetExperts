import React, { useState, useEffect } from 'react';
import { Home, Plus, Trash2 } from 'lucide-react';
import { Household } from '../types';

interface HouseholdsProps {
  onUpdate?: () => void;
}

export default function Households({ onUpdate }: HouseholdsProps) {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [newHousehold, setNewHousehold] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const fetchHouseholds = async () => {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) return;
    
    const response = await fetch('/api/households', {
      headers: {
        'Authorization': `Bearer ${sessionId}`
      }
    });
    const data = await response.json();
    setHouseholds(data);
  };

  const addHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHousehold.name.trim()) return;

    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) return;

    try {
      const response = await fetch('/api/households', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify(newHousehold),
      });
      
      if (!response.ok) {
        console.error('Fehler beim Hinzufügen des Haushalts:', await response.text());
        alert('Fehler beim Hinzufügen des Haushalts');
        return;
      }

      setNewHousehold({ name: '', description: '' });
      await fetchHouseholds();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Haushalts:', error);
      alert('Fehler beim Hinzufügen des Haushalts: ' + error);
    }
  };

  const deleteHousehold = async (id: number) => {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) return;
    
    if (confirm('Möchten Sie diesen Haushalt wirklich löschen? Alle zugehörigen Daten werden ebenfalls gelöscht.')) {
      await fetch(`/api/households/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });
      await fetchHouseholds();
      if (onUpdate) onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Home className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Haushalte verwalten</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Neuen Haushalt anlegen</h3>
        <form onSubmit={addHousehold} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Haushaltsname *
              </label>
              <input
                type="text"
                value={newHousehold.name}
                onChange={(e) => setNewHousehold({ ...newHousehold, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Haupthaushalt, Ferienwohnung"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung
              </label>
              <input
                type="text"
                value={newHousehold.description}
                onChange={(e) => setNewHousehold({ ...newHousehold, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional"
              />
            </div>
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Haushalt hinzufügen
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Meine Haushalte</h3>
        {households.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Noch keine Haushalte angelegt. Erstellen Sie Ihren ersten Haushalt oben.
          </p>
        ) : (
          <div className="space-y-3">
            {households.map((household) => (
              <div
                key={household.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-800">{household.name}</h4>
                  </div>
                  {household.description && (
                    <p className="text-sm text-gray-600 mt-1 ml-7">{household.description}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteHousehold(household.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Haushalt löschen"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
