import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, FileText, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function ProfileHealthTab({ user }: { user: any }) {
  const [medicines, setMedicines] = useState(['Atorvastatin 20mg', 'Metformin 500mg', 'Amlodipine 5mg']);
  const [newMed, setNewMed] = useState('');
  
  const addMedicine = () => {
    if (newMed.trim() && !medicines.includes(newMed)) {
      setMedicines([...medicines, newMed.trim()]);
      setNewMed('');
    }
  };

  const removeMedicine = (med: string) => {
    setMedicines(medicines.filter((m) => m !== med));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500/20" />
            <CardTitle>Health Preferences</CardTitle>
          </div>
          <CardDescription>We use this information to provide faster service during emergencies.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-4 border-b pb-6">
            <h3 className="font-semibold text-sm text-foreground">Frequently Used Medicines</h3>
            <div className="flex flex-wrap gap-2">
              {medicines.map((med) => (
                <Badge key={med} variant="secondary" className="px-3 py-1.5 text-sm font-medium gap-2">
                  {med}
                  <button onClick={() => removeMedicine(med)} className="hover:text-destructive text-muted-foreground transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm mt-4">
              <Input 
                placeholder="Add a medicine..." 
                value={newMed} 
                onChange={(e) => setNewMed(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addMedicine()}
              />
              <Button onClick={addMedicine} variant="outline" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-foreground">Chronic Condition Notes</h3>
            <Textarea 
              placeholder="e.g., Type 2 Diabetes, Hypertension. Any allergies to specific drugs like Penicillin?"
              className="min-h-[120px] resize-none"
              defaultValue="Allergic to Sulfa drugs. Mild asthma."
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3" /> This information is kept strictly confidential.
            </p>
            <Button className="w-full sm:w-auto mt-2">Save Preferences</Button>
          </div>
          
        </CardContent>
      </Card>
      
      {/* Prescription Uploads Future Feature Placeholder */}
      <Card className="border-dashed border-2 opacity-70">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">Prescription Uploads</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Coming soon! You'll be able to securely upload and store your digital prescriptions here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
