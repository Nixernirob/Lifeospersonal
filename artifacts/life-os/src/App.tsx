import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Memories from "@/pages/memories";
import Notes from "@/pages/notes";
import University from "@/pages/university";
import Achievements from "@/pages/achievements";
import Projects from "@/pages/projects";
import BucketList from "@/pages/bucketlist";
import Statistics from "@/pages/statistics";
import Journal from "@/pages/journal";
import Friends from "@/pages/friends";
import FutureLetters from "@/pages/future-letters";
import Settings from "@/pages/settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/memories" component={Memories} />
        <Route path="/notes" component={Notes} />
        <Route path="/university" component={University} />
        <Route path="/achievements" component={Achievements} />
        <Route path="/projects" component={Projects} />
        <Route path="/bucketlist" component={BucketList} />
        <Route path="/statistics" component={Statistics} />
        <Route path="/journal" component={Journal} />
        <Route path="/friends" component={Friends} />
        <Route path="/future-letters" component={FutureLetters} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
