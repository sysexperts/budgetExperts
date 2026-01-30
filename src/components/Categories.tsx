import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, Check, X, Home, Car, ShoppingCart, Utensils, Heart, Briefcase, Gamepad2, Book, Dumbbell, Music, Film, Plane, Coffee, Smartphone, Laptop, Shirt, Pill, GraduationCap, Baby, Dog, Cat, TreePine, Zap, Shield, Wrench } from 'lucide-react';
import { Category } from '../types';

interface CategoriesProps {
  onUpdate?: () => void;
}

const availableIcons = [
  { name: 'Tag', icon: Tag, default: true },
  { name: 'Home', icon: Home },
  { name: 'Car', icon: Car },
  { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'Utensils', icon: Utensils },
  { name: 'Heart', icon: Heart },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Book', icon: Book },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'Music', icon: Music },
  { name: 'Film', icon: Film },
  { name: 'Plane', icon: Plane },
  { name: 'Coffee', icon: Coffee },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Laptop', icon: Laptop },
  { name: 'Shirt', icon: Shirt },
  { name: 'Pill', icon: Pill },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Baby', icon: Baby },
  { name: 'Dog', icon: Dog },
  { name: 'Cat', icon: Cat },
  { name: 'TreePine', icon: TreePine },
  { name: 'Zap', icon: Zap },
  { name: 'Shield', icon: Shield },
  { name: 'Wrench', icon: Wrench }
];

export default function Categories({ onUpdate }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingIcon, setEditingIcon] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newCategory, type: 'expense', icon: selectedIcon }),
      });

      if (!response.ok) {
        alert('Kategorie existiert bereits');
        return;
      }

      setNewCategory('');
      setSelectedIcon('Tag');
      await fetchCategories();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Kategorie:', error);
      alert('Fehler beim Hinzufügen der Kategorie');
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditingIcon(category.icon || 'Tag');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingIcon('');
  };

  const saveEdit = async (id: number) => {
    if (!editingName.trim()) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: editingName, icon: editingIcon }),
      });

      if (!response.ok) {
        alert('Kategorie existiert bereits');
        return;
      }

      setEditingId(null);
      setEditingName('');
      setEditingIcon('');
      await fetchCategories();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Fehler beim Bearbeiten der Kategorie:', error);
      alert('Fehler beim Bearbeiten der Kategorie');
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm('Möchten Sie diese Kategorie wirklich löschen?')) return;

    try {
      await fetch(`/api/categories/${id}`, { 
        method: 'DELETE'
      });
      await fetchCategories();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Fehler beim Löschen der Kategorie:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Tag className="w-8 h-8 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-800">Kategorien verwalten</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Neue Kategorie anlegen</h3>
        <form onSubmit={addCategory} className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="z.B. Kleidung, Freizeit"
              required
            />
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Hinzufügen
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon auswählen</label>
            <div className="grid grid-cols-8 gap-2">
              {availableIcons.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedIcon(name)}
                  className={`p-2 rounded-md border-2 transition-colors ${
                    selectedIcon === name
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={name}
                >
                  <Icon className="w-5 h-5 text-gray-700" />
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Meine Kategorien</h3>
        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Noch keine Kategorien angelegt.
          </p>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {editingId === category.id ? (
                  <>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                        autoFocus
                      />
                      <div className="grid grid-cols-8 gap-1">
                        {availableIcons.map(({ name, icon: Icon }) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => setEditingIcon(name)}
                            className={`p-1 rounded border transition-colors ${
                              editingIcon === name
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            title={name}
                          >
                            <Icon className="w-4 h-4 text-gray-700" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-3">
                      <button
                        onClick={() => saveEdit(category.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                        title="Speichern"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Abbrechen"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const iconData = availableIcons.find(i => i.name === category.icon);
                        const Icon = iconData ? iconData.icon : Tag;
                        return <Icon className="w-5 h-5 text-purple-600" />;
                      })()}
                      <span className="font-medium text-gray-800">{category.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(category)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Bearbeiten"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Löschen"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
