import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DonorAuthProvider } from "@/contexts/DonorAuthContext";
import { Shell } from "@/components/layout/Shell";

// Pages
import Dashboard from "@/pages/Dashboard";
import Donors from "@/pages/Donors";
import RegisterDonor from "@/pages/RegisterDonor";
import BloodRequests from "@/pages/BloodRequests";
import CreateBloodRequest from "@/pages/CreateBloodRequest";
import Notifications from "@/pages/Notifications";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/donors" component={Donors} />
        <Route path="/donors/register" component={RegisterDonor} />
        <Route path="/requests" component={BloodRequests} />
        <Route path="/requests/new" component={CreateBloodRequest} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/login" component={Login} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DonorAuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </DonorAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
