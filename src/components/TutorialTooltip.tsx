import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface TutorialTooltipProps {
  onComplete: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'overview',
    title: 'Übersicht',
    description: 'Hier siehst du eine Zusammenfassung deiner monatlichen Ausgaben und Abonnements.',
    position: 'bottom'
  },
  {
    id: 'navigation',
    title: 'Navigation',
    description: 'Nutze die Tabs oben, um zwischen verschiedenen Bereichen zu wechseln.',
    position: 'bottom'
  },
  {
    id: 'categories',
    title: 'Kategorien',
    description: 'Verwalte deine Ausgabenkategorien im Tab "Kategorien". Du kannst eigene Kategorien erstellen und bearbeiten.',
    position: 'bottom'
  },
  {
    id: 'costs',
    title: 'Fixkosten & Abonnements',
    description: 'Füge wiederkehrende Kosten hinzu und behalte den Überblick über alle Ausgaben.',
    position: 'bottom'
  }
];

export default function TutorialTooltip({ onComplete }: TutorialTooltipProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(true);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('tutorialCompleted', 'true');
    setShow(false);
    onComplete();
  };

  if (!show) return null;

  const step = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-800">{step.title}</h3>
            <span className="text-sm text-gray-500">
              {currentStep + 1} / {tutorialSteps.length}
            </span>
          </div>
          <p className="text-gray-600">{step.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 font-medium"
          >
            Tutorial überspringen
          </button>
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            {currentStep < tutorialSteps.length - 1 ? (
              <>
                Weiter <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              'Fertig'
            )}
          </button>
        </div>

        <div className="flex gap-1 mt-4">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded ${
                index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
