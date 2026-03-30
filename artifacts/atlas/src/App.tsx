import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ModeProvider } from "@/lib/mode-context";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Prepare from "@/pages/prepare";
import Help from "@/pages/help";
import Practice from "@/pages/practice";
import Onboarding, { hasCompletedOnboarding } from "@/pages/onboarding";

const queryClient = new QueryClient();

function Router() {
  const onboarded = hasCompletedOnboarding();

  return (
    <Switch>
      {/* Redirect root to onboarding if first visit */}
      <Route path="/">
        {onboarded ? <Home /> : <Redirect to="/onboarding" />}
      </Route>
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/prepare" component={Prepare} />
      <Route path="/help" component={Help} />
      <Route path="/practice" component={Practice} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ModeProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </ModeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
