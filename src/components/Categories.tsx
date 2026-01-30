import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, Check, X, Home, Car, ShoppingCart, Utensils, Heart, Briefcase, Gamepad2, Book, Dumbbell, Music, Film, Plane, Coffee, Smartphone, Laptop, Shirt, Pill, GraduationCap, Baby, Dog, Cat, TreePine, Zap, Shield, Wrench, DollarSign } from 'lucide-react';
import { Category } from '../types';

interface CategoriesProps {
  onUpdate?: () => void;
}

const availableIcons = [
  { name: 'Tag', icon: DollarSign, category: 'Allgemein' },
  { name: 'Home', icon: Home, category: 'Wohnen' },
  { name: 'Car', icon: Car, category: 'Transport' },
  { name: 'ShoppingCart', icon: ShoppingCart, category: 'Einkaufen' },
  { name: 'Utensils', icon: Utensils, category: 'Essen' },
  { name: 'Heart', icon: Heart, category: 'Gesundheit' },
  { name: 'Briefcase', icon: Briefcase, category: 'Arbeit' },
  { name: 'Gamepad2', icon: Gamepad2, category: 'Unterhaltung' },
  { name: 'Book', icon: Book, category: 'Bildung' },
  { name: 'Dumbbell', icon: Dumbbell, category: 'Sport' },
  { name: 'Music', icon: Music, category: 'Medien' },
  { name: 'Film', icon: Film, category: 'Medien' },
  { name: 'Plane', icon: Plane, category: 'Reisen' },
  { name: 'Coffee', icon: Coffee, category: 'Essen' },
  { name: 'Smartphone', icon: Smartphone, category: 'Technik' },
  { name: 'Laptop', icon: Laptop, category: 'Technik' },
  { name: 'Shirt', icon: Shirt, category: 'Kleidung' },
  { name: 'Pill', icon: Pill, category: 'Gesundheit' },
  { name: 'GraduationCap', icon: GraduationCap, category: 'Bildung' },
  { name: 'Baby', icon: Baby, category: 'Familie' },
  { name: 'Dog', icon: Dog, category: 'Tiere' },
  { name: 'Cat', icon: Cat, category: 'Tiere' },
  { name: 'TreePine', icon: TreePine, category: 'Natur' },
  { name: 'Zap', icon: Zap, category: 'Allgemein' },
  { name: 'Shield', icon: Shield, category: 'Sicherheit' },
  { name: 'Wrench', icon: Wrench, category: 'Werkzeug' }
];

const iconCategories = [...new Set(availableIcons.map(icon => icon.category))];

export default function Categories({ onUpdate }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingIcon, setEditingIcon] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');

  const filteredIcons = availableIcons.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Alle' || icon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
              className="flex items-center gap-2 px-4 py-2 bg-maxcrowds-green text-white rounded-md hover:bg-maxcrowds-green-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              Hinzufügen
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Icon auswählen</label>
            <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
              {/* Search Bar */}
              <div className="p-3 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Icons suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-maxcrowds-green focus:border-transparent text-sm"
                />
              </div>
              
              {/* Category Filter */}
              <div className="p-3 border-b border-gray-200">
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setSelectedCategory('Alle')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedCategory === 'Alle'
                        ? 'bg-maxcrowds-green text-white border border-maxcrowds-green'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    Alle
                  </button>
                  {iconCategories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-maxcrowds-green text-white border border-maxcrowds-green'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Icon Grid */}
              <div className="p-3 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-10 gap-1">
                  {filteredIcons.map(({ name, icon: Icon }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setSelectedIcon(name)}
                      className={`p-1.5 rounded border transition-all hover:scale-110 hover:shadow-md ${
                        selectedIcon === name
                          ? 'border-maxcrowds-green bg-maxcrowds-green/10 shadow-sm'
                          : 'border-gray-200 hover:border-maxcrowds-green bg-white'
                      }`}
                      title={name}
                    >
                      <Icon className={`w-4 h-4 ${
                        selectedIcon === name ? 'text-maxcrowds-green' : 'text-gray-600'
                      }`} />
                    </button>
                  ))}
                </div>
                {filteredIcons.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Keine Icons gefunden
                  </div>
                )}
              </div>
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
                        className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maxcrowds-green focus:border-transparent mb-2"
                        autoFocus
                      />
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="grid grid-cols-6 gap-2">
                          {availableIcons.map(({ name, icon: Icon }) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => setEditingIcon(name)}
                              className={`p-2 rounded-lg border transition-all transform hover:scale-105 ${
                                editingIcon === name
                                  ? 'border-maxcrowds-green bg-maxcrowds-green/10 shadow-md'
                                  : 'border-gray-300 bg-white hover:border-maxcrowds-green hover:bg-maxcrowds-green/5'
                              }`}
                              title={name}
                            >
                              <Icon className={`w-5 h-5 ${
                                editingIcon === name ? 'text-maxcrowds-green' : 'text-gray-600'
                              }`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-3">
                      <button
                        onClick={() => saveEdit(category.id)}
                        className="p-1 text-maxcrowds-green hover:bg-maxcrowds-green/10 rounded-md transition-colors"
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
                        return <Icon className="w-5 h-5 text-maxcrowds-green" />;
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
