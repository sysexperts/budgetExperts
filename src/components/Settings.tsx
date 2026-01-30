import { useState } from 'react';
import { Settings as SettingsIcon, ChevronRight, Download } from 'lucide-react';
import Households from './Households';
import FamilyMembers from './FamilyMembers';
import Categories from './Categories';
import ExportReports from './ExportReports';
import { Household, FamilyMember } from '../types';

interface SettingsProps {
  households: Household[]
  familyMembers: FamilyMember[]
  fixedCosts: any[]
  subscriptions: any[]
  installmentPlans: any[]
  onUpdate: () => void;
}

type SettingsTab = 'households' | 'members' | 'categories' | 'export';

export default function Settings({ households, familyMembers, fixedCosts, subscriptions, installmentPlans, onUpdate }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('households');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-gray-700" />
        <h1 className="text-3xl font-bold text-gray-900">Einstellungen</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('households')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'households'
                  ? 'border-maxcrowds-green text-maxcrowds-green bg-maxcrowds-green/10'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Haushalte
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'members'
                  ? 'border-maxcrowds-green text-maxcrowds-green bg-maxcrowds-green/10'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Familienmitglieder
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'categories'
                  ? 'border-maxcrowds-green text-maxcrowds-green bg-maxcrowds-green/10'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Kategorien
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'export'
                  ? 'border-maxcrowds-green text-maxcrowds-green bg-maxcrowds-green/10'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'households' && (
            <Households onUpdate={onUpdate} />
          )}
          {activeTab === 'members' && (
            <FamilyMembers 
              familyMembers={familyMembers}
              households={households}
              onUpdate={onUpdate}
            />
          )}
          {activeTab === 'categories' && (
            <Categories onUpdate={onUpdate} />
          )}
          {activeTab === 'export' && (
            <ExportReports 
              familyMembers={familyMembers}
              fixedCosts={fixedCosts}
              subscriptions={subscriptions}
              installmentPlans={installmentPlans}
            />
          )}
        </div>
      </div>

      <div className="bg-maxcrowds-light-gray border border-maxcrowds-green/20 rounded-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <ChevronRight className="w-5 h-5 text-maxcrowds-green" />
          Über diese Einstellungen
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-maxcrowds-green font-bold">•</span>
            <span><strong>Haushalte:</strong> Verwalte verschiedene Haushalte und deren Beschreibungen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-maxcrowds-green font-bold">•</span>
            <span><strong>Familienmitglieder:</strong> Füge Personen hinzu und ordne sie Haushalten zu</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-maxcrowds-green font-bold">•</span>
            <span><strong>Kategorien:</strong> Erstelle und bearbeite Ausgabenkategorien für bessere Übersicht</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
