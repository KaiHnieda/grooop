import { useState } from 'react';
import { X, Upload, Palette, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { workspaceService } from '../services/workspaceService';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import type { Workspace } from '../types';

interface WorkspaceCustomizeModalProps {
  workspace: Workspace;
  onClose: () => void;
  onUpdate: (workspace: Workspace) => void;
  onDelete?: () => void;
}

const PRESET_COLORS = [
  { name: 'Lila', value: '#7c3aed', class: 'bg-purple-500' },
  { name: 'Blau', value: '#3b82f6', class: 'bg-blue-500' },
  { name: 'Grün', value: '#10b981', class: 'bg-green-500' },
  { name: 'Gelb', value: '#f59e0b', class: 'bg-yellow-500' },
  { name: 'Rot', value: '#ef4444', class: 'bg-red-500' },
  { name: 'Pink', value: '#ec4899', class: 'bg-pink-500' },
  { name: 'Indigo', value: '#6366f1', class: 'bg-indigo-500' },
  { name: 'Türkis', value: '#14b8a6', class: 'bg-teal-500' },
];

// Helper function to normalize color to 6-digit hex format
const normalizeColor = (color: string): string => {
  if (!color || color === '') return '';
  // Remove whitespace
  color = color.trim();
  // If it's a 3-digit hex, convert to 6-digit
  if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toUpperCase();
  }
  // If it's already 6-digit, return uppercase
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return color.toUpperCase();
  }
  // If invalid, return empty string to trigger validation error
  return '';
};

export default function WorkspaceCustomizeModal({
  workspace,
  onClose,
  onUpdate,
  onDelete,
}: WorkspaceCustomizeModalProps) {
  const [name, setName] = useState(workspace.name || '');
  const [description, setDescription] = useState(workspace.description || '');
  const [selectedColor, setSelectedColor] = useState(workspace.color || '#7c3aed');
  const [customColor, setCustomColor] = useState(workspace.color || '#7c3aed');
  const [imageUrl, setImageUrl] = useState(workspace.imageUrl || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('Bitte wähle eine Bilddatei aus');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      error('Datei ist zu groß (max. 10MB)');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const fullUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${response.data.data.url}`;
        setImageUrl(fullUrl);
        success('Bild erfolgreich hochgeladen');
      }
    } catch (err: any) {
      error(err.response?.data?.error || 'Fehler beim Hochladen des Bildes');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    // Validate name
    if (!name.trim()) {
      error('Der Name darf nicht leer sein');
      return;
    }

    setSaving(true);
    try {
      // Validate and normalize color
      const trimmedColor = selectedColor?.trim() || '';
      if (trimmedColor && !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmedColor)) {
        error('Bitte gib eine gültige Hex-Farbe ein (z.B. #FF0000 oder #F00)');
        setSaving(false);
        return;
      }
      
      // Normalize color to 6-digit hex format
      const normalizedColor = normalizeColor(trimmedColor);
      
      const updated = await workspaceService.update(workspace.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        color: normalizedColor || undefined,
        imageUrl: imageUrl || null,
      });

      onUpdate(updated);
      success('Workspace erfolgreich angepasst');
      onClose();
    } catch (err: any) {
      error(err.response?.data?.error || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Möchtest du diesen Arbeitsbereich wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    setDeleting(true);
    try {
      await workspaceService.delete(workspace.id);
      success('Arbeitsbereich erfolgreich gelöscht');
      onClose();
      if (onDelete) {
        onDelete();
      } else {
        navigate('/');
      }
    } catch (err: any) {
      error(err.response?.data?.error || 'Fehler beim Löschen des Arbeitsbereichs');
    } finally {
      setDeleting(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold dark:text-white">Workspace anpassen</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="workspace-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                id="workspace-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Arbeitsbereich-Name"
                required
              />
            </div>

            {/* Beschreibung */}
            <div>
              <label htmlFor="workspace-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Beschreibung
              </label>
              <textarea
                id="workspace-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Optionale Beschreibung des Arbeitsbereichs"
              />
            </div>

            {/* Vorschau */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vorschau
              </label>
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                {imageUrl ? (
                  <div className="relative h-32">
                    <img
                      src={imageUrl}
                      alt="Workspace"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="h-32 w-full"
                    style={{ backgroundColor: selectedColor }}
                  />
                )}
                <div className="p-4 bg-white dark:bg-gray-800">
                  <h3 className="font-semibold text-lg dark:text-white">{name || workspace.name}</h3>
                  {description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bild-Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bild
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-primary-500 transition-colors">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {uploading ? 'Lädt...' : 'Bild hochladen'}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Farbe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Farbe
              </label>
              <div className="space-y-4">
                {/* Preset-Farben */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Vordefinierte Farben</p>
                  <div className="grid grid-cols-8 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => {
                          setSelectedColor(color.value);
                          setCustomColor(color.value);
                        }}
                        className={`w-10 h-10 rounded-lg ${color.class} border-2 transition-all ${
                          selectedColor === color.value
                            ? 'border-gray-900 dark:border-white scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom-Farbe */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Eigene Farbe</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        setSelectedColor(e.target.value);
                      }}
                      className="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        setSelectedColor(e.target.value);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder="#7c3aed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2 pt-4">
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Speichert...' : 'Speichern'}
                </button>
                <button
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Abbrechen
                </button>
              </div>
              
              {/* Delete Button */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? 'Löscht...' : 'Arbeitsbereich löschen'}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Diese Aktion kann nicht rückgängig gemacht werden
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

