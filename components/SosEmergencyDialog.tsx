'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Mic,
  Square,
  Play,
  Volume2,
  Camera,
  FileAudio,
  AlertTriangle,
  Activity,
  Wifi,
  Loader2,
  ShieldAlert,
  Trash2,
  CheckCircle,
  MapPin,
  Clock
} from 'lucide-react';
import ApiClient from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SosEmergencyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type StepType = 'input' | 'broadcasting' | 'offers' | 'success';

export default function SosEmergencyDialog({ isOpen, onOpenChange }: SosEmergencyDialogProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { location } = useGeolocation();

  const [step, setStep] = useState<StepType>('input');
  const [textNote, setTextNote] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState<string | null>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // SOS broadcast states
  const [activeSosId, setActiveSosId] = useState<string | null>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsLocked, setGpsLocked] = useState(false);

  // Check if there is an active SOS request on mount/open
  useEffect(() => {
    if (isOpen && user) {
      checkActiveSos();
    }
  }, [isOpen, user]);

  const checkActiveSos = async () => {
    try {
      const res = await ApiClient.getActiveSosRequest();
      if (res.data) {
        setActiveSosId(res.data._id);
        setTextNote(res.data.textNote || '');
        if (res.data.offers && res.data.offers.length > 0) {
          // Normalize populated pharmacy fields
          const mappedOffers = res.data.offers.map((o: any) => ({
            _id: o._id,
            pharmacyId: o.pharmacyId?._id || o.pharmacyId,
            pharmacyName: o.pharmacyId?.name || 'Local Pharmacy',
            price: o.price,
            estimatedMinutes: o.estimatedMinutes,
            notes: o.notes,
            rating: o.pharmacyId?.rating || 5
          }));
          setOffers(mappedOffers);
          setStep('offers');
        } else {
          setStep('broadcasting');
        }
      } else {
        // Reset states
        setStep('input');
        setTextNote('');
        setPrescriptionFile(null);
        setPrescriptionPreview(null);
        setAudioBlob(null);
        setAudioUrl(null);
        setOffers([]);
        setActiveSosId(null);
      }
    } catch (err) {
      console.error('Error checking active SOS request:', err);
    }
  };

  // GPS locked check
  useEffect(() => {
    if (location) {
      setGpsLocked(true);
    } else {
      setGpsLocked(false);
    }
  }, [location]);

  // Live Socket connection for broadcast offers
  useEffect(() => {
    if (user && isOpen && (step === 'broadcasting' || step === 'offers')) {
      const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      });
      socket.on('connect', () => {
        console.log('[SOS Live] Socket connected for user:', user.id);
      });

      socket.on(`sos-offer-received-${user.id}`, (data: any) => {
        console.log('[SOS Live] Offer received:', data);
        toast.info(`New quote received from ${data.offer.pharmacyName}!`);
        setOffers(prev => {
          // Prevent duplicates
          if (prev.some(o => o.pharmacyId === data.offer.pharmacyId)) {
            return prev.map(o => o.pharmacyId === data.offer.pharmacyId ? data.offer : o);
          }
          return [...prev, data.offer];
        });
        setStep('offers');
      });      return () => {
        socket.disconnect();
      };
    }
  }, [user, step, isOpen]);

  // Audio Recording Helpers
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        // Stop audio tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 29) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to start audio recording:', err);
      toast.error('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const playAudio = () => {
    if (audioPlayerRef.current && audioUrl) {
      audioPlayerRef.current.play();
    }
  };

  const deleteAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingSeconds(0);
  };

  // Prescription photo helpers
  const handlePrescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPrescriptionFile(file);
      setPrescriptionPreview(URL.createObjectURL(file));
    }
  };

  const deletePrescription = () => {
    setPrescriptionFile(null);
    setPrescriptionPreview(null);
  };

  // Submit SOS Broadcast
  const handleSendBroadcast = async () => {
    if (!location) {
      toast.error('GPS Location lock required to route emergency request. Checking location...');
      return;
    }

    if (!textNote && !audioBlob && !prescriptionFile) {
      toast.error('Please describe what you need using text, voice note, or a prescription image.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
      formData.append('textNote', textNote);
      formData.append('address', JSON.stringify({
        street: 'SOS Live GPS Coordinate',
        city: 'Emergency Dispatch',
        state: '',
        pincode: ''
      }));

      if (prescriptionFile) {
        formData.append('prescription', prescriptionFile);
      }

      if (audioBlob) {
        formData.append('voiceNote', audioBlob, 'sos-voice.webm');
      }

      const res = await ApiClient.createSosRequest(formData);

      if (res.data) {
        setActiveSosId(res.data.sosRequest._id);
        toast.success(`SOS Signal Broadcasted to ${res.data.pharmaciesNotified} pharmacies!`);
        setStep('broadcasting');
      } else {
        toast.error(res.error || 'Failed to broadcast SOS request');
      }
    } catch (err) {
      console.error('SOS Submit error:', err);
      toast.error('An error occurred while launching SOS broadcast');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel broadcast
  const handleCancelBroadcast = async () => {
    if (!activeSosId) return;

    try {
      await ApiClient.cancelSosRequest(activeSosId);
      toast.info('Emergency broadcast cancelled.');
      setStep('input');
      checkActiveSos();
    } catch (err) {
      console.error('Cancel SOS error:', err);
    }
  };

  // Accept specific pharmacy bid
  const handleAcceptOffer = async (offerId: string) => {
    if (!activeSosId) return;

    try {
      const res = await ApiClient.acceptSosOffer(activeSosId, offerId);
      if (res.data) {
        toast.success('Offer accepted! Emergency delivery order dispatched.');
        setStep('success');
        setTimeout(() => {
          onOpenChange(false);
          router.push(`/app/track-order/${res.data.orderId}`);
        }, 3000);
      } else {
        toast.error(res.error || 'Failed to accept offer');
      }
    } catch (err) {
      console.error('Accept offer error:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md rounded-3xl border-0 shadow-2xl overflow-hidden p-0 animate-in zoom-in-95 duration-200">
        <div className="bg-red-600 px-6 py-5 text-white flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm animate-pulse border border-white/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight uppercase">SOS Emergency Checkout</h2>
            <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Fastest Direct-to-Pharmacy Route</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {step === 'input' && (
            <div className="space-y-5">
              {/* Geolocation Lock Status */}
              <div className={`p-4 rounded-2xl flex items-center justify-between border ${
                gpsLocked ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30' : 'bg-rose-50/50 border-rose-100 dark:bg-rose-950/10 dark:border-rose-900/30'
              }`}>
                <div className="flex items-center gap-3">
                  <MapPin className={`w-5 h-5 ${gpsLocked ? 'text-emerald-500' : 'text-rose-500 animate-bounce'}`} />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block text-zinc-800 dark:text-zinc-200">
                      {gpsLocked ? 'GPS Lock Secured' : 'Checking GPS Location...'}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      {gpsLocked && location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Required for immediate routing'}
                    </span>
                  </div>
                </div>
                {gpsLocked ? (
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100/50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">Optimized</span>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-widest text-rose-600 bg-rose-100/50 dark:bg-rose-950/30 px-2.5 py-1 rounded-full animate-pulse">Required</span>
                )}
              </div>

              {/* Text details */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block px-1">Describe Medicines Needed</Label>
                <Textarea
                  placeholder="Type medicine names, descriptions, or emergency notes here..."
                  value={textNote}
                  onChange={(e) => setTextNote(e.target.value)}
                  className="rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 p-4 text-sm font-medium focus:border-red-500/50 focus:ring-red-500/10 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all min-h-[90px]"
                />
              </div>

              {/* Media Inputs (Audio & Prescription) */}
              <div className="grid grid-cols-2 gap-4">
                {/* Audio recorder widget */}
                <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Voice Note</span>
                  
                  {isRecording ? (
                    <div className="flex flex-col items-center gap-2 animate-pulse">
                      <Button
                        type="button"
                        onClick={stopRecording}
                        size="icon"
                        className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
                      >
                        <Square className="w-5 h-5 fill-white" />
                      </Button>
                      <span className="text-xs font-bold text-red-600">{`00:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds}`}</span>
                    </div>
                  ) : audioUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={playAudio}
                          size="icon"
                          variant="secondary"
                          className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                        >
                          <Play className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
                        </Button>
                        <Button
                          type="button"
                          onClick={deleteAudio}
                          size="icon"
                          variant="ghost"
                          className="w-9 h-9 rounded-full text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <span className="text-[8px] font-black uppercase text-emerald-600 tracking-wider flex items-center gap-1">
                        <FileAudio className="w-3 h-3" /> Voice Saved
                      </span>
                      <audio ref={audioPlayerRef} src={audioUrl} className="hidden" />
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={startRecording}
                      size="icon"
                      variant="outline"
                      className="w-12 h-12 rounded-full border-2 border-zinc-200 hover:border-red-500 hover:bg-red-50/50"
                    >
                      <Mic className="w-5 h-5 text-zinc-600" />
                    </Button>
                  )}
                </div>

                {/* Prescription Image Widget */}
                <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 bg-zinc-50/50 dark:bg-zinc-900/30 relative overflow-hidden">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Prescription Photo</span>

                  {prescriptionPreview ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center gap-1">
                      <img src={prescriptionPreview} alt="Prescription" className="w-12 h-12 object-cover rounded-lg border border-zinc-200" />
                      <Button
                        type="button"
                        onClick={deletePrescription}
                        size="icon"
                        variant="destructive"
                        className="w-5 h-5 rounded-full absolute -top-1 -right-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <span className="text-[8px] font-black uppercase text-emerald-600 tracking-wider">Photo Added</span>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePrescriptionChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        id="prescription-capture"
                      />
                      <Label htmlFor="prescription-capture" className="w-12 h-12 rounded-full border-2 border-zinc-200 hover:border-red-500 hover:bg-red-50/50 flex items-center justify-center cursor-pointer">
                        <Camera className="w-5 h-5 text-zinc-600" />
                      </Label>
                    </>
                  )}
                </div>
              </div>

              {/* Surging warning */}
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-amber-800 dark:bg-amber-950/10 dark:border-amber-900/30">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
                <p className="text-[10px] font-medium leading-relaxed">
                  SOS requests are broadcasted as high-priority medical emergencies. A dynamic surge fee may apply, and open pharmacies will quote their best delivery times.
                </p>
              </div>

              {/* Submit Action */}
              <Button
                onClick={handleSendBroadcast}
                disabled={isSubmitting || !gpsLocked}
                className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-red-600/20 border-0 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Broadcasting...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 animate-pulse" /> Send Emergency Signal
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 'broadcasting' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-8">
              {/* Radar ring animation */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping duration-1000"></div>
                <div className="absolute w-28 h-28 bg-red-500/20 rounded-full animate-ping duration-1500 delay-300"></div>
                <div className="absolute w-16 h-16 bg-red-600 rounded-full shadow-lg flex items-center justify-center border-4 border-white">
                  <Wifi className="w-6 h-6 text-white animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">Broadcasting Signal...</h3>
                <p className="text-xs text-muted-foreground font-semibold max-w-xs leading-relaxed">
                  Securing connections with the 3 nearest open pharmacies. Standing by for instant price offers...
                </p>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-black text-red-600 uppercase tracking-widest">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                <span>Scanning Local Nodes</span>
              </div>

              <Button
                onClick={handleCancelBroadcast}
                variant="outline"
                className="h-12 px-6 rounded-xl border-zinc-200 hover:bg-red-50 hover:text-red-600 text-xs font-black uppercase tracking-widest"
              >
                Cancel SOS Broadcast
              </Button>
            </div>
          )}

          {step === 'offers' && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <div className="inline-block px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest">
                  Quotes Received
                </div>
                <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase">Compare & Confirm</h3>
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Tap any offer to dispatch instantly via Cash on Delivery</p>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {offers.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground border-2 border-dashed border-zinc-100 rounded-2xl bg-zinc-50/50">
                    <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Waiting for quotes...</span>
                  </div>
                ) : (
                  offers.map((offer) => (
                    <CardOfferItem
                      key={offer._id}
                      offer={offer}
                      onAccept={() => handleAcceptOffer(offer._id)}
                    />
                  ))
                )}
              </div>

              <div className="pt-2 flex justify-between gap-4">
                <Button
                  onClick={handleCancelBroadcast}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-500"
                >
                  Cancel SOS
                </Button>
                <Button
                  onClick={checkActiveSos}
                  variant="ghost"
                  className="h-12 rounded-xl text-xs font-black uppercase tracking-widest text-red-600 hover:bg-red-50"
                >
                  Refresh
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">SOS Dispatch Active!</h3>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed font-semibold">
                  Pharmacy has accepted your emergency. A delivery rider is being auto-assigned to your GPS coordinates.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest animate-pulse">
                <span>Redirecting to live tracker...</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CardOfferItemProps {
  offer: any;
  onAccept: () => void;
}

function CardOfferItem({ offer, onAccept }: CardOfferItemProps) {
  return (
    <div className="p-4 rounded-2xl border border-zinc-150 hover:border-red-500/30 bg-white shadow-sm hover:shadow-md transition-all flex flex-col gap-4 animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h4 className="font-black text-sm text-zinc-800 leading-tight">{offer.pharmacyName}</h4>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">★ {offer.rating?.toFixed(1) || '5.0'}</span>
            {offer.notes && (
              <span className="text-[9px] font-medium text-zinc-400 italic max-w-[150px] truncate">"{offer.notes}"</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">Estimated Price</span>
          <span className="text-lg font-black text-zinc-900">₹{offer.price}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-3">
        <div className="flex items-center gap-2 text-zinc-500">
          <Clock className="w-4 h-4 text-red-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700">
            {offer.estimatedMinutes} mins delivery
          </span>
        </div>
        <Button
          onClick={onAccept}
          className="h-10 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-[9px] font-black uppercase tracking-widest border-0"
        >
          Confirm COD Dispatch
        </Button>
      </div>
    </div>
  );
}
