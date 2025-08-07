import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";


// Hercules SFMS Core System Pages
import { KPIDashboard } from "./pages/hercules-sfms/KPIDashboard";
import { BatchCalendar } from "./pages/hercules-sfms/BatchCalendar";
import { Reports } from "./pages/hercules-sfms/Reports";
import { Admin } from "./pages/hercules-sfms/Admin";

function Router() {
  return (
    <Switch>
      {/* Hercules SFMS Core System Routes */}
      <Route path="/" component={KPIDashboard} />
      <Route path="/kpi-dashboard" component={KPIDashboard} />
      <Route path="/batch-calendar" component={BatchCalendar} />
      <Route path="/reports" component={Reports} />
      <Route path="/admin" component={Admin} />
      

      

      
      {/* Catch all - redirect to KPI dashboard */}
      <Route component={() => { window.location.href = '/kpi-dashboard'; return null; }} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
