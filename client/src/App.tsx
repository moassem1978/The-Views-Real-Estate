import { Switch, Route } from "wouter";
import { Toaster } from "./components/ui/toaster";
import Header from "./components/Header";
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import EMAAARMividaProject from "./pages/EMAAARMividaProject";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/properties" component={Properties} />
          <Route path="/properties/:id" component={PropertyDetails} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/projects/emaar-mivida" component={EMAAARMividaProject} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Toaster />
    </div>
  );
}

export default App;