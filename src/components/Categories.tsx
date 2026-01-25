import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Category } from '../types';

interface CategoriesProps {
  onUpdate?: () => void;
}

export default function Categories({ onUpdate }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

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
        body: JSON.stringify({ name: newCategory, type: 'expense' }),
      });

      if (!response.ok) {
        alert('Kategorie existiert bereits');
        return;
      }

      setNewCategory('');
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
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEdit = async (id: number) => {
    if (!editingName.trim()) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: editingName }),
      });

      if (!response.ok) {
        alert('Kategorie existiert bereits');
        return;
      }

      setEditingId(null);
      setEditingName('');
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
        <form onSubmit={addCategory} className="flex gap-3">
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
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
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
                      <Tag className="w-5 h-5 text-purple-600" />
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
