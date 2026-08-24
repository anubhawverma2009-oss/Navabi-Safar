import React, { useState } from 'react';
import { PlaceVibe, PlaceCategory, ItineraryResult } from '../types';
import { ItineraryService } from '../services/itineraryService';
import { 
  Calendar, Clock, IndianRupee, Sparkles, MapPin, CheckCircle2, 
  Share2, ArrowRight, RotateCcw, Compass, Navigation, Utensils, Landmark 
} from 'lucide-react';

interface BuildMyDayPageProps {
  onNavigate: (route: string) => void;
}

export const BuildMyDayPage: React.FC<BuildMyDayPageProps> = ({ onNavigate }) => {
  const [durationHours, setDurationHours] = useState<number>(6);
  const [budgetPerPerson, setBudgetPerPerson] = useState<number>(800);
  const [startTiming, setStartTiming] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [selectedVibes, setSelectedVibes] = useState<PlaceVibe[]>(['Heritage', 'Food']);
  const [generatedPlan, setGeneratedPlan] = useState<ItineraryResult | null>(null);
  const [copied, setCopied] = useState(false);

  const availableVibes: PlaceVibe[] = [
    'Heritage', 'Food', 'Photography', 'Peaceful', 
    'Shopping', 'Sunset', 'Culture', 'Architecture'
  ];

  const handleToggleVibe = (vibe: PlaceVibe) => {
    if (selectedVibes.includes(vibe)) {
      if (selectedVibes.length > 1) {
        setSelectedVibes(selectedVibes.filter(v => v !== vibe));
      }
    } else {
      setSelectedVibes([...selectedVibes, vibe]);
    }
  };

  const handleGeneratePlan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const categories: PlaceCategory[] = ['historical', 'food', 'shopping', 'parks', 'culture'];
    const plan = ItineraryService.generateDayPlan({
      durationHours,
      budgetPerPerson,
      vibes: selectedVibes,
      categories,
      startTiming,
      pace: 'moderate'
    });
    setGeneratedPlan(plan);
  };

  const handleCopyItinerary = () => {
    if (!generatedPlan) return;
    const text = `NAWABI SAFAR — My Lucknow Day Plan\n${generatedPlan.title}\nTotal Est. Budget: ₹${generatedPlan.totalBudget}\n\n` +
      generatedPlan.stops.map(s => `• ${s.timeSlot} — ${s.place.name} (~₹${s.estimatedExpense})\n  ${s.activityHint}`).join('\n\n') +
      `\n\nCurated with Nawabi Safar: https://nawabisafar.in`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] py-12" id="build-my-lucknow-day-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/60 mb-3">
            <Calendar className="w-4 h-4 text-amber-700" />
            <span>Deterministic Day Planner</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading text-stone-900 leading-tight">
            Build My Lucknow Day
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-2">
            Customize your hours, budget, and desired Awadhi vibes. We construct a seamless, hour-by-hour route for you.
          </p>
        </div>

        {/* Input Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-md mb-12">
          <form onSubmit={handleGeneratePlan} className="space-y-8">
            {/* 1. Time Duration */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 block flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700" />
                1. How much time do you have?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { hours: 3, label: '3 Hours (Quick Tour)' },
                  { hours: 6, label: '6 Hours (Half Day)' },
                  { hours: 8, label: '8 Hours (Full Day)' },
                  { hours: 10, label: '10 Hours (Complete Awadh)' }
                ].map(item => (
                  <button
                    type="button"
                    key={item.hours}
                    onClick={() => setDurationHours(item.hours)}
                    className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold border transition-all text-center ${
                      durationHours === item.hours
                        ? 'bg-amber-600 text-white border-amber-700 shadow-md'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Budget Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-amber-700" />
                  2. Approximate Budget (Per Person)
                </label>
                <span className="text-sm font-extrabold text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                  ₹{budgetPerPerson}
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="3000"
                step="100"
                value={budgetPerPerson}
                onChange={e => setBudgetPerPerson(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-stone-400 mt-1">
                <span>₹200 (Budget Street Trail)</span>
                <span>₹1,500 (Heritage & Dining)</span>
                <span>₹3,000+ (Luxury Awadh)</span>
              </div>
            </div>

            {/* 3. Start Timing */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 block">
                3. Preferred Starting Window
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'morning', label: 'Morning (09:00 AM)', hint: 'Ideal for monuments & tea' },
                  { id: 'afternoon', label: 'Afternoon (01:30 PM)', hint: 'Ideal for kebabs & shopping' },
                  { id: 'evening', label: 'Evening (04:00 PM)', hint: 'Ideal for sunset & nightlife' }
                ].map(t => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setStartTiming(t.id as any)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      startTiming === t.id
                        ? 'bg-stone-900 text-white border-stone-950 shadow-md'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-bold">{t.label}</div>
                    <div className={`text-[10px] mt-0.5 ${startTiming === t.id ? 'text-amber-300' : 'text-stone-400'}`}>
                      {t.hint}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Select Desired Vibes */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 block flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-700" />
                4. Select Desired Vibes (Multi-select)
              </label>
              <div className="flex flex-wrap gap-2">
                {availableVibes.map(vibe => {
                  const isSelected = selectedVibes.includes(vibe);
                  return (
                    <button
                      type="button"
                      key={vibe}
                      onClick={() => handleToggleVibe(vibe)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      <span>#{vibe}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate CTA */}
            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-stone-500">
                Rule-based algorithm with real Lucknow travel routes & pricing.
              </span>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                id="generate-day-plan-btn"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate My Itinerary</span>
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {generatedPlan ? (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-amber-300 shadow-xl space-y-8 animate-fade-in" id="generated-itinerary-result">
            {/* Title & Share Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
                  Customized Safar
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif-heading text-stone-900 mt-2">
                  {generatedPlan.title}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  {generatedPlan.summary}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyItinerary}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs shadow flex items-center gap-1.5 transition-all"
                  id="copy-itinerary-btn"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copied ? 'Itinerary Copied!' : 'Copy Itinerary'}</span>
                </button>
              </div>
            </div>

            {/* Total Budget & Timeline Summary Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-amber-50/60 border border-amber-200">
              <div>
                <div className="text-stone-500 text-xs font-medium">Estimated Total Spend</div>
                <div className="text-xl font-bold text-amber-900 mt-0.5">~₹{generatedPlan.totalBudget} / person</div>
              </div>
              <div>
                <div className="text-stone-500 text-xs font-medium">Total Stops</div>
                <div className="text-xl font-bold text-stone-900 mt-0.5">{generatedPlan.stops.length} Iconic Stops</div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="text-stone-500 text-xs font-medium">Pacing</div>
                <div className="text-xl font-bold text-stone-900 mt-0.5">{durationHours} Hours Leisure</div>
              </div>
            </div>

            {/* Timeline Stops */}
            <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-amber-300">
              {generatedPlan.stops.map((stop, idx) => (
                <div key={idx} className="relative flex items-start gap-4 sm:gap-6 pl-2">
                  {/* Step Number Circle */}
                  <div className="w-10 h-10 rounded-full bg-amber-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md border-2 border-white z-10">
                    {idx + 1}
                  </div>

                  {/* Stop Card */}
                  <div className="flex-1 bg-stone-50 rounded-2xl p-5 sm:p-6 border border-stone-200/80 hover:border-amber-400 transition-all shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-md inline-block">
                        {stop.timeSlot}
                      </span>
                      <span className="text-xs font-bold text-stone-600">
                        Est. Cost: ₹{stop.estimatedExpense}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-stone-900 font-serif-heading">
                      {stop.place.name}
                    </h3>
                    <p className="text-xs text-amber-900 font-medium">{stop.place.area} • {stop.place.category}</p>

                    <p className="text-xs sm:text-sm text-stone-700 mt-2 leading-relaxed">
                      {stop.activityHint}
                    </p>

                    {stop.travelTips && (
                      <div className="mt-3 text-xs text-stone-500 bg-white p-2.5 rounded-xl border border-stone-200 flex items-center gap-2">
                        <Navigation className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>{stop.travelTips}</span>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between">
                      <button
                        onClick={() => onNavigate(`/places/${stop.place.slug}`)}
                        className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
                      >
                        View Place Guide & Photos <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Reset / Replan */}
            <div className="pt-6 border-t border-stone-200 text-center">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-xs font-bold text-stone-600 hover:text-stone-900 inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Adjust Parameters & Replan</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-stone-200/80 p-8 shadow-sm">
            <Compass className="w-12 h-12 text-amber-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-900 font-serif-heading">
              Ready to Craft Your Day?
            </h3>
            <p className="text-xs text-stone-600 max-w-sm mx-auto mt-1">
              Select your parameters above and click <strong>“Generate My Itinerary”</strong> to get a tailored Lucknow schedule.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
