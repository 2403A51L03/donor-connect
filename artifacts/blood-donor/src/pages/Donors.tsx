import { useState } from "react";
import { Link } from "wouter";
import { HeartPulse, MapPin, Phone, Mail, Search, CheckCircle2, XCircle } from "lucide-react";
import { useListDonors } from "@workspace/api-client-react";
import { Card, Button, Input, Select, Badge } from "@/components/shared/UI";
import { motion } from "framer-motion";

export default function Donors() {
  const [bloodType, setBloodType] = useState("");
  const [city, setCity] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  const { data: donors, isLoading } = useListDonors({ 
    bloodType: bloodType || undefined, 
    city: city || undefined,
    available: availableOnly ? true : undefined,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Find Donors</h1>
          <p className="text-muted-foreground mt-2">Search our network of registered life-savers.</p>
        </div>
        <Link href="/donors/register">
          <Button className="gap-2 w-full md:w-auto">
            <HeartPulse className="w-5 h-5" /> Become a Donor
          </Button>
        </Link>
      </div>

      <Card className="p-4 md:p-6 bg-white/50 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by city..."
              className="pl-12"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <Select value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
            <option value="">All Blood Types</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </Select>
          <button
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all duration-200 ${
              availableOnly
                ? "border-green-400 bg-green-50 text-green-700"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {availableOnly ? "Available Only" : "Show Available Only"}
          </button>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="h-48 animate-pulse bg-muted" />
          ))}
        </div>
      ) : !donors?.length ? (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <UsersIcon className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-display font-bold">No donors found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your filters or search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donors.map((donor, index) => (
            <motion.div
              key={donor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 h-full flex flex-col hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-rose-400 rounded-2xl flex items-center justify-center shadow-md shadow-primary/20 text-white font-display font-bold text-xl">
                      {donor.bloodType}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{donor.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3.5 h-3.5 mr-1" /> {donor.city}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2" /> Phone
                    </span>
                    <a href={`tel:${donor.phone}`} className="font-medium hover:text-primary transition-colors">{donor.phone}</a>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-muted-foreground">
                      <Mail className="w-4 h-4 mr-2" /> Email
                    </span>
                    <a href={`mailto:${donor.email}`} className="font-medium hover:text-primary transition-colors truncate max-w-[150px]">{donor.email}</a>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-2">
                    <span className="text-muted-foreground">Status</span>
                    {donor.isAvailable ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Available
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 gap-1">
                        <XCircle className="w-3 h-3" /> Unavailable
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Stub for local icon usage if missing from lucide
function UsersIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
