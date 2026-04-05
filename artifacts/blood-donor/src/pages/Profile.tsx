import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { User, Phone, MapPin, Mail, Droplet, Calendar, ToggleLeft, ToggleRight, LogOut, Pencil, Check, X, Clock } from "lucide-react";
import { useGetDonor, useUpdateDonor, getListDonorsQueryKey, getGetStatsQueryKey, getGetDonorQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Button, Input, Badge } from "@/components/shared/UI";
import { useDonorAuth } from "@/contexts/DonorAuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Profile() {
  const { donorId, logout, isRegistered } = useDonorAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editingPhone, setEditingPhone] = useState(false);
  const [editingCity, setEditingCity] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [phoneVal, setPhoneVal] = useState("");
  const [cityVal, setCityVal] = useState("");
  const [dateVal, setDateVal] = useState("");

  const { data: donor, isLoading } = useGetDonor(donorId!, {
    query: { enabled: !!donorId }
  });

  const { mutate: updateDonor, isPending } = useUpdateDonor({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDonorsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        if (donorId) queryClient.invalidateQueries({ queryKey: getGetDonorQueryKey(donorId) });
        setEditingPhone(false);
        setEditingCity(false);
        setEditingDate(false);
        toast({ title: "Profile updated", description: "Your changes have been saved." });
      },
      onError: () => {
        toast({ title: "Update failed", description: "Could not save changes.", variant: "destructive" });
      }
    }
  });

  if (!isRegistered || !donorId) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-3">No profile found</h2>
        <p className="text-muted-foreground mb-6">You need to log in or register to view your profile.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login"><Button variant="outline">Log In</Button></Link>
          <Link href="/donors/register"><Button>Register as Donor</Button></Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[1, 2, 3].map(i => <Card key={i} className="h-32 animate-pulse bg-muted" />)}
      </div>
    );
  }

  if (!donor) {
    return <div className="text-center py-20 text-muted-foreground">Donor profile not found.</div>;
  }

  const toggleAvailability = () => {
    updateDonor({ id: donor.id, data: { isAvailable: !donor.isAvailable } });
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
    toast({ title: "Logged out", description: "See you next time!" });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground hover:text-destructive gap-2">
            <LogOut className="w-4 h-4" /> Log Out
          </Button>
        </div>
        <p className="text-muted-foreground">Manage your donor profile and availability.</p>
      </motion.div>

      {/* Identity Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
        <Card className="p-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-rose-400 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 text-white font-bold text-2xl shrink-0">
              {donor.bloodType}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-foreground">{donor.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="flex items-center gap-1.5 text-sm">
                  <Droplet className="w-3.5 h-3.5 text-primary" /> {donor.bloodType} Blood Type
                </Badge>
                {donor.isAvailable ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Available to Donate
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">
                    Not Available
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Member since {format(new Date(donor.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Availability Toggle */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className={`p-6 border-2 transition-colors ${donor.isAvailable ? "border-green-200 bg-green-50/30" : "border-border bg-background"}`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-foreground text-lg">Donation Availability</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {donor.isAvailable
                  ? "You are visible to hospitals and patients. You will receive blood request alerts."
                  : "You are hidden from search results and will not receive new alerts."}
              </p>
            </div>
            <button
              onClick={toggleAvailability}
              disabled={isPending}
              className={`shrink-0 transition-colors ${isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              aria-label="Toggle availability"
            >
              {donor.isAvailable ? (
                <ToggleRight className="w-14 h-14 text-green-500" strokeWidth={1.5} />
              ) : (
                <ToggleLeft className="w-14 h-14 text-muted-foreground" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Contact Details */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <Card className="p-6 space-y-5">
          <h3 className="font-bold text-foreground text-lg">Contact Details</h3>

          {/* Email — read-only */}
          <div className="flex items-center justify-between gap-4 py-3 border-b border-border">
            <div className="flex items-center gap-3 text-sm min-w-0">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">Email (login)</p>
                <p className="font-medium truncate">{donor.email}</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">Cannot change</span>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between gap-4 py-3 border-b border-border">
            <div className="flex items-center gap-3 text-sm min-w-0 flex-1">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                {editingPhone ? (
                  <Input
                    type="tel"
                    value={phoneVal}
                    onChange={e => setPhoneVal(e.target.value)}
                    className="h-8 text-sm"
                    autoFocus
                  />
                ) : (
                  <p className="font-medium">{donor.phone}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {editingPhone ? (
                <>
                  <button onClick={() => updateDonor({ id: donor.id, data: { phone: phoneVal } })} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingPhone(false)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button onClick={() => { setPhoneVal(donor.phone); setEditingPhone(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* City */}
          <div className="flex items-center justify-between gap-4 py-3 border-b border-border">
            <div className="flex items-center gap-3 text-sm min-w-0 flex-1">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">City</p>
                {editingCity ? (
                  <Input
                    value={cityVal}
                    onChange={e => setCityVal(e.target.value)}
                    className="h-8 text-sm"
                    autoFocus
                  />
                ) : (
                  <p className="font-medium">{donor.city}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {editingCity ? (
                <>
                  <button onClick={() => updateDonor({ id: donor.id, data: { city: cityVal } })} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingCity(false)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button onClick={() => { setCityVal(donor.city); setEditingCity(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Last Donation Date */}
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3 text-sm min-w-0 flex-1">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">Last Donation Date</p>
                {editingDate ? (
                  <Input
                    type="date"
                    value={dateVal}
                    onChange={e => setDateVal(e.target.value)}
                    className="h-8 text-sm"
                    autoFocus
                  />
                ) : (
                  <p className="font-medium">
                    {donor.lastDonationDate
                      ? format(new Date(donor.lastDonationDate), "MMMM d, yyyy")
                      : <span className="text-muted-foreground italic">Not set</span>}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {editingDate ? (
                <>
                  <button onClick={() => updateDonor({ id: donor.id, data: { lastDonationDate: dateVal || null } })} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingDate(false)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button onClick={() => { setDateVal(donor.lastDonationDate ?? ""); setEditingDate(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Donor ID note */}
      <p className="text-center text-xs text-muted-foreground">
        Donor ID #{donor.id} · Your email <strong>{donor.email}</strong> is your login key
      </p>
    </div>
  );
}
