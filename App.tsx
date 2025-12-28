import React, { useState } from "react";
import { Search, Filter, ShieldCheck, Map as MapIcon, Loader2, Sparkles } from "lucide-react";
import BusinessList from "./components/BusinessList";
import MapContainer from "./components/MapContainer";
import { searchBusinesses } from "./services/geminiService";
import { Business, FilterState } from "./types";

const App: React.FC = () => {
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [filters, setFilters] = useState<FilterState>({ minRating: 0 });
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry || !city) return;

    setLoading(true);
    setBusinesses([]);
    setSelectedBusiness(null);

    try {
      const results = await searchBusinesses(industry, city);
      setBusinesses(results);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch leads. Please check your API key or try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(
    (b) => b.rating >= filters.minRating
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar - Control Panel */}
      <div className="w-full md:w-[450px] flex flex-col border-r border-slate-800 bg-slate-950 z-10 shadow-2xl shrink-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-cyan-500" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Midnight<span className="text-cyan-500">Scout</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 ml-1">AI-Powered Lead Intelligence</p>
        </div>

        {/* Search Controls */}
        <div className="p-6 space-y-4 border-b border-slate-800 bg-slate-900/30">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Industry
              </label>
              <input
                type="text"
                placeholder="e.g. Dentist, Real Estate, Gym"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Target City
              </label>
              <input
                type="text"
                placeholder="e.g. Seattle, Austin, London"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !industry || !city}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(8,145,178,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Scouting...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Launch Scout
                </>
              )}
            </button>
          </form>

          {/* Filters Toggle */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                showFilters ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Filter className="w-3 h-3" />
              {showFilters ? "Hide Filters" : "Filter Results"}
            </button>
            <span className="text-xs text-slate-600">
              {filteredBusinesses.length} leads found
            </span>
          </div>

          {/* Collapsible Filters */}
          {showFilters && (
            <div className="pt-3 animate-in slide-in-from-top-2 duration-200">
               <div className="flex items-center justify-between bg-slate-900 p-3 rounded-md border border-slate-800">
                 <span className="text-xs text-slate-400">Min Rating</span>
                 <div className="flex gap-1">
                   {[0, 3, 4, 4.5].map((r) => (
                     <button
                        key={r}
                        onClick={() => setFilters({ ...filters, minRating: r })}
                        className={`px-2 py-1 text-xs rounded border transition-all ${
                          filters.minRating === r
                            ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                            : "bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700"
                        }`}
                     >
                       {r === 0 ? "All" : `${r}+`}
                     </button>
                   ))}
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto bg-slate-950 scroll-smooth">
          <BusinessList
            businesses={filteredBusinesses}
            selectedId={selectedBusiness?.id || null}
            onSelect={setSelectedBusiness}
            loading={loading}
          />
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="hidden md:block flex-1 relative bg-slate-900">
        <MapContainer
          businesses={filteredBusinesses}
          selectedBusiness={selectedBusiness}
          onMarkerClick={setSelectedBusiness}
        />
        
        {/* Map Overlay Badge */}
        <div className="absolute top-6 left-6 z-[1000] bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 shadow-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-slate-200">Live Map Connection</span>
            <div className="h-3 w-[1px] bg-slate-700"></div>
            <span className="text-xs text-slate-400 flex items-center gap-1">
               <MapIcon className="w-3 h-3" /> Area View
            </span>
        </div>
      </div>
    </div>
  );
};

export default App;
