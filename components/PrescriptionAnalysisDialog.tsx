'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Pill,
  Trash2,
  Edit2,
  Plus,
  Search,
  Check,
  X,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Loader2,
  SearchCode
} from 'lucide-react';
import { ApiClient } from '@/lib/api';
import { toast } from 'sonner';

export interface ExtractedMedicine {
  raw?: string;
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  medicine?: any;
  inventory?: any;
  status?: string;
}

interface PrescriptionAnalysisDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isAnalyzing: boolean;
  extractedMedicines: ExtractedMedicine[];
  onMedicinesChange: (medicines: ExtractedMedicine[]) => void;
  isGeminiActive?: boolean;
  isOcrUnavailable?: boolean;
  role: 'user' | 'pharmacy';
  onAction: (medicines: ExtractedMedicine[]) => void;
}

export default function PrescriptionAnalysisDialog({
  isOpen,
  onOpenChange,
  isAnalyzing,
  extractedMedicines,
  onMedicinesChange,
  isGeminiActive,
  isOcrUnavailable,
  role,
  onAction,
}: PrescriptionAnalysisDialogProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ExtractedMedicine>({ name: '' });
  const [autocompleteQuery, setAutocompleteQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchingCatalog, setIsSearchingCatalog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch catalog suggestions when autocompleteQuery changes
  useEffect(() => {
    if (autocompleteQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingCatalog(true);
      try {
        const response = await ApiClient.getMedicinesCatalog(autocompleteQuery);
        if (response.data) {
          setSuggestions(response.data);
        }
      } catch (error) {
        console.error('Error fetching catalog suggestions:', error);
      } finally {
        setIsSearchingCatalog(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [autocompleteQuery]);

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    const item = extractedMedicines[index];
    setEditForm({ ...item });
    setAutocompleteQuery(item.name);
    setSuggestions([]);
  };

  const handleEditSave = async (index: number) => {
    if (!editForm.name.trim()) {
      toast.error('Medicine name is required');
      return;
    }

    const updated = [...extractedMedicines];
    
    // Perform database lookup/validation if name changed
    let finalItem = { ...editForm };
    if (editForm.name !== extractedMedicines[index].name) {
      try {
        // Query catalog to see if it exists
        const searchRes = await ApiClient.getMedicinesCatalog(editForm.name);
        const match = searchRes.data?.find(
          (m: any) => m.name.toLowerCase() === editForm.name.trim().toLowerCase()
        );
        
        if (match) {
          finalItem.medicine = match;
          finalItem.name = match.name;
          finalItem.status = role === 'pharmacy' ? 'In Stock' : 'Found in catalog';
          
          if (role === 'pharmacy') {
            // Also update inventory status
            try {
              const profile = await ApiClient.getPharmacyProfile();
              if (profile.data) {
                const invItem = profile.data.inventory?.find(
                  (inv: any) => inv.medicineId?.toString() === match._id?.toString()
                );
                finalItem.inventory = invItem || null;
                finalItem.status = invItem ? 'In Stock' : 'Out of Stock';
              }
            } catch (invErr) {
              console.error(invErr);
            }
          }
        } else {
          finalItem.medicine = null;
          finalItem.inventory = null;
          finalItem.status = role === 'pharmacy' ? 'Not found in catalog' : 'Found in catalog';
        }
      } catch (err) {
        console.error('Error matching catalog item:', err);
      }
    }

    updated[index] = finalItem;
    onMedicinesChange(updated);
    setEditingIndex(null);
    toast.success('Medicine details updated');
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setSuggestions([]);
  };

  const handleDelete = (index: number) => {
    const updated = extractedMedicines.filter((_, i) => i !== index);
    onMedicinesChange(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
    toast.success('Medicine removed');
  };

  const handleAddNew = () => {
    const newMed: ExtractedMedicine = {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      status: role === 'pharmacy' ? 'Not found in catalog' : 'Found in catalog',
    };
    onMedicinesChange([...extractedMedicines, newMed]);
    handleEditStart(extractedMedicines.length);
  };

  const selectSuggestion = (sug: any) => {
    setEditForm({
      ...editForm,
      name: sug.name,
      medicine: sug,
    });
    setAutocompleteQuery(sug.name);
    setSuggestions([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white">Prescription Analysis</DialogTitle>
              <DialogDescription className="font-bold text-white/70 uppercase text-[10px] tracking-widest mt-0.5">
                AI medicine identifier and verification tool
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 min-h-0">
          {isAnalyzing ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <RefreshCw className="w-12 h-12 text-[#0b8a4f] animate-spin" />
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest animate-pulse">Decoding Handwriting...</p>
            </div>
          ) : (
            <>
              {/* STATUS BANNER */}
              {isOcrUnavailable ? (
                <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-xs">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                  <div>
                    <span className="font-bold block text-rose-900 mb-0.5">OCR Service Restricted</span>
                    We uploaded the image, but offline OCR processing failed in this hosting environment. Please use the "Add Item" button below to input your prescription medicines manually.
                  </div>
                </div>
              ) : isGeminiActive ? (
                <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs shadow-sm">
                  <Sparkles className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5 animate-pulse" />
                  <div>
                    <span className="font-bold block text-emerald-900 mb-0.5">AI Analysis Complete</span>
                    Google Gemini has successfully extracted prescription medicines with high fidelity. You can verify, edit, or search them below.
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800 text-xs">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-900 mb-0.5">Running in Offline fallback Mode</span>
                    Using offline regex parsing. For 99% accurate AI handwriting transcription, configure the <code className="px-1.5 py-0.5 bg-amber-100 rounded font-mono text-[10px] text-amber-900">GEMINI_API_KEY</code> environment variable.
                  </div>
                </div>
              )}

              {/* MEDICINES LIST */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Extracted Medicines ({extractedMedicines.length})</span>
                  {!editingIndex && (
                    <Button
                      onClick={handleAddNew}
                      variant="outline"
                      size="sm"
                      className="h-8 border-dashed border-emerald-500 text-[#0b8a4f] hover:bg-emerald-50 rounded-xl font-bold text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
                    </Button>
                  )}
                </div>

                {extractedMedicines.map((item, idx) => {
                  const isEditing = editingIndex === idx;

                  if (isEditing) {
                    return (
                      <div key={idx} className="p-5 bg-emerald-50/40 rounded-3xl border-2 border-emerald-500 space-y-4 animate-in fade-in duration-200">
                        {/* Auto-suggest Medicine Name Input */}
                        <div className="space-y-2 relative" ref={dropdownRef}>
                          <label className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Medicine Name</label>
                          <div className="relative">
                            <Input
                              value={autocompleteQuery}
                              onChange={(e) => {
                                setAutocompleteQuery(e.target.value);
                                setEditForm({ ...editForm, name: e.target.value });
                              }}
                              placeholder="e.g. Paracetamol"
                              className="h-11 rounded-xl bg-white border-emerald-200 focus-visible:ring-emerald-500 pr-10 text-sm font-semibold"
                            />
                            {isSearchingCatalog ? (
                              <Loader2 className="absolute right-3 top-3 w-5 h-5 text-emerald-600 animate-spin" />
                            ) : (
                              <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                            )}
                          </div>

                          {/* Autocomplete suggestions */}
                          {suggestions.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-30 max-h-[160px] overflow-y-auto">
                              {suggestions.map((sug) => (
                                <button
                                  key={sug._id}
                                  type="button"
                                  onClick={() => selectSuggestion(sug)}
                                  className="w-full text-left px-4 py-2.5 hover:bg-emerald-50/50 text-xs font-semibold border-b border-gray-50 last:border-0 transition-colors flex items-center justify-between text-gray-700"
                                >
                                  <span>{sug.name}</span>
                                  <Badge className="bg-emerald-100 text-emerald-800 text-[8px] border-none font-black uppercase">Catalog</Badge>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Dosage and Frequency Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-emerald-800/80 uppercase tracking-widest">Dosage</label>
                            <Input
                              value={editForm.dosage || ''}
                              onChange={(e) => setEditForm({ ...editForm, dosage: e.target.value })}
                              placeholder="e.g. 500 mg"
                              className="h-10 rounded-xl bg-white border-emerald-100 focus-visible:ring-emerald-500 text-xs"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-emerald-800/80 uppercase tracking-widest">Frequency</label>
                            <Input
                              value={editForm.frequency || ''}
                              onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
                              placeholder="e.g. 1-0-1 or Twice a day"
                              className="h-10 rounded-xl bg-white border-emerald-100 focus-visible:ring-emerald-500 text-xs"
                            />
                          </div>
                        </div>

                        {/* Duration and Instructions Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-emerald-800/80 uppercase tracking-widest">Duration</label>
                            <Input
                              value={editForm.duration || ''}
                              onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                              placeholder="e.g. 5 days"
                              className="h-10 rounded-xl bg-white border-emerald-100 focus-visible:ring-emerald-500 text-xs"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-emerald-800/80 uppercase tracking-widest">Instructions</label>
                            <Input
                              value={editForm.instructions || ''}
                              onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
                              placeholder="e.g. After food"
                              className="h-10 rounded-xl bg-white border-emerald-100 focus-visible:ring-emerald-500 text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleEditCancel}
                            className="h-9 rounded-lg font-bold text-xs hover:bg-gray-100 text-gray-500"
                          >
                            <X className="w-3.5 h-3.5 mr-1" /> Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleEditSave(idx)}
                            className="h-9 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" /> Save Details
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  // Read-only Mode Card
                  return (
                    <div key={idx} className="flex items-center justify-between p-5 bg-gray-50 hover:bg-emerald-50/10 rounded-3xl border border-gray-100 hover:border-[#0b8a4f]/20 transition-all group">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-emerald-100/40 text-[#0b8a4f] rounded-2xl flex items-center justify-center shrink-0 mt-0.5">
                          <Pill className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-900 uppercase tracking-tight text-sm">
                            {item.name || 'Unnamed Medicine'}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {role === 'pharmacy' && item.status && (
                              <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0 ${
                                item.status === 'In Stock' 
                                  ? 'text-emerald-700 border-emerald-200 bg-emerald-50' 
                                  : 'text-rose-600 border-rose-200 bg-rose-50'
                              }`}>
                                {item.status}
                              </Badge>
                            )}
                            {item.dosage && (
                              <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter text-blue-600 border-blue-200 bg-blue-50">
                                {item.dosage}
                              </Badge>
                            )}
                            {item.frequency && (
                              <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter text-green-600 border-green-200 bg-green-50">
                                {item.frequency}
                              </Badge>
                            )}
                            {item.duration && (
                              <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter text-amber-600 border-amber-200 bg-amber-50">
                                {item.duration}
                              </Badge>
                            )}
                            {item.instructions && (
                              <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter text-purple-600 border-purple-200 bg-purple-50">
                                {item.instructions}
                              </Badge>
                            )}
                            {!item.dosage && !item.frequency && !item.duration && !item.instructions && (
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">No dosage info</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditStart(idx)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                          title="Edit Item"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(idx)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {extractedMedicines.length === 0 && (
                  <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No medicines identified yet</p>
                    <p className="text-gray-400 text-[10px] uppercase font-bold mt-1">Click "Add Item" to add manually</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {!isAnalyzing && extractedMedicines.length > 0 && (
          <DialogFooter className="p-6 bg-gray-50 border-t border-gray-100 flex-row gap-3 sm:justify-between shrink-0">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100"
            >
              Close
            </Button>
            <Button
              onClick={() => onAction(extractedMedicines)}
              className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#0b8a4f] hover:bg-[#086b3d] text-white shadow-lg shadow-emerald-700/20"
            >
              {role === 'pharmacy' ? 'Add Verified to Bill' : 'Find Medicines'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
