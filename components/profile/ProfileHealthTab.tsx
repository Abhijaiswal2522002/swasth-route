'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, FileText, Plus, X, Loader2, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import ApiClient from '@/lib/api';
import { toast } from 'sonner';

interface ProfileHealthTabProps {
  user: any;
  onHealthUpdated?: (updatedData?: any) => void;
}

export default function ProfileHealthTab({ user, onHealthUpdated }: ProfileHealthTabProps) {
  const [medicines, setMedicines] = useState<string[]>([]);
  const [newMed, setNewMed] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.healthPreferences) {
      setMedicines(user.healthPreferences.frequentlyUsedMedicines || []);
      setChronicConditions(user.healthPreferences.chronicConditions || '');
      setAllergies(user.healthPreferences.allergies || '');
    } else {
      // Sensible initial fallbacks if user has never configured preferences
      setMedicines(['Atorvastatin 20mg', 'Metformin 500mg']);
      setChronicConditions('None specified');
      setAllergies('');
    }
  }, [user]);
  
  const addMedicine = () => {
    const trimmed = newMed.trim();
    if (!trimmed) return;
    if (medicines.some(m => m.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Medicine already added');
      return;
    }
    setMedicines([...medicines, trimmed]);
    setNewMed('');
  };

  const removeMedicine = (med: string) => {
    setMedicines(medicines.filter((m) => m !== med));
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      const payload = {
        healthPreferences: {
          frequentlyUsedMedicines: medicines,
          chronicConditions: chronicConditions.trim(),
          allergies: allergies.trim(),
        },
      };

      const res = await ApiClient.updateUserProfile(payload);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Health preferences saved successfully!');
        if (onHealthUpdated) {
          onHealthUpdated(res.data?.user || payload);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save health preferences');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500/20" />
            <CardTitle>Health Preferences</CardTitle>
          </div>
          <CardDescription>We use this information to provide faster emergency services and avoid drug interactions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          
          {/* Frequently used medicines */}
          <div className="space-y-4 border-b border-gray-100 pb-6">
            <div>
              <h3 className="font-bold text-sm text-foreground">Frequently Used Medicines / Regular Prescriptions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Quickly select these during emergency one-tap reorders.</p>
            </div>
            
            <div className="flex flex-wrap gap-2 min-h-8">
              {medicines.length > 0 ? (
                medicines.map((med) => (
                  <Badge key={med} variant="secondary" className="px-3 py-1.5 text-sm font-medium gap-2 rounded-xl">
                    {med}
                    <button 
                      type="button" 
                      onClick={() => removeMedicine(med)} 
                      className="hover:text-destructive text-muted-foreground transition-colors ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No regular medicines added yet.</p>
              )}
            </div>

            <div className="flex gap-2 max-w-sm mt-3">
              <Input 
                placeholder="Add a medicine (e.g. Paracetamol 500mg)" 
                value={newMed} 
                onChange={(e) => setNewMed(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addMedicine();
                  }
                }}
                className="rounded-xl"
              />
              <Button type="button" onClick={addMedicine} variant="outline" size="icon" className="rounded-xl shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Chronic conditions and allergies */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <h3 className="font-bold text-sm text-foreground">Chronic Conditions & Medical History</h3>
              <Textarea 
                placeholder="e.g., Type 2 Diabetes, Hypertension, Asthma..."
                className="min-h-[90px] resize-none rounded-xl"
                value={chronicConditions}
                onChange={(e) => setChronicConditions(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm text-foreground">Known Drug Allergies</h3>
              <Input 
                placeholder="e.g., Allergic to Penicillin, Sulfa drugs..."
                className="rounded-xl"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              This information is encrypted and strictly shared only with fulfilling pharmacies during emergency orders.
            </p>

            <Button 
              onClick={handleSavePreferences} 
              disabled={isSaving}
              className="w-full sm:w-auto mt-3 gap-2 rounded-xl font-bold"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Preferences
            </Button>
          </div>
          
        </CardContent>
      </Card>
      
      {/* Prescription Uploads Feature Info */}
      <Card className="border-dashed border-2 rounded-3xl bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-gray-900">Digital Prescription Vault</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Prescriptions uploaded during checkout are securely archived with your orders and can be reused for refill verification.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
