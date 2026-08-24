import React from 'react';
import { Landmark, Utensils, Scissors, Sparkles, BookOpen, Clock, Heart, Compass } from 'lucide-react';

interface AboutLucknowPageProps {
  onNavigate: (route: string) => void;
}

export const AboutLucknowPage: React.FC<AboutLucknowPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] py-12" id="about-lucknow-culture-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-stone-950 text-white p-8 sm:p-14 shadow-2xl border border-stone-800 lucknow-pattern">
          <div className="relative z-10 max-w-3xl">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30">
              The City of Nawabs & Tehzeeb
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-serif-heading text-white mt-4 leading-tight">
              The Living Soul of Awadh
            </h1>
            <p className="text-stone-300 text-sm sm:text-base md:text-lg mt-4 leading-relaxed font-sans">
              Lucknow is not merely a geographic city — it is an emotion, a refined civilization, an exquisite culinary banquet, and a living sanctuary of courteous hospitality known throughout the world as <em>Lakhnawi Tehzeeb</em>.
            </p>
          </div>
        </div>

        {/* 1. History & Nawabi Heritage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
              <Landmark className="w-4 h-4 text-amber-600" />
              <span>Centuries of Grandeur</span>
            </div>
            <h2 className="text-3xl font-bold font-serif-heading text-stone-900 leading-snug">
              From Lakshmanpur to Royal Awadh
            </h2>
            <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
              Legend holds that Lucknow was originally founded by Lakshmana, the younger brother of Lord Rama, and known as Lakshmanavati or Lakshmanpur. The city rose to imperial magnificence in 1775 when Nawab Asaf-ud-Daula shifted the royal capital of the Awadh kingdom from Faizabad to Lucknow.
            </p>
            <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
              Under subsequent Nawabs like Saadat Ali Khan, Ghazi-ud-Din Haidar, and the legendary patron-poet Nawab Wajid Ali Shah, Lucknow blossomed into the undisputed cultural and artistic capital of northern India, rivaling Delhi, Isfahan, and Paris.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-xl border border-stone-200 bg-stone-900 h-80 sm:h-96">
            <img
              src="https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=80"
              alt="Bara Imambara Historic Architecture"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 2. Pillars of Lucknow's Identity (Grid) */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold font-serif-heading text-stone-900">
              The Four Pillars of Lakhnawi Heritage
            </h2>
            <p className="text-stone-600 text-sm mt-2">
              Every street corner, court recipe, and embroidered fabric tells a 250-year story.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pillar 1: Tehzeeb & Language */}
            <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <Heart className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold font-serif-heading text-stone-900">
                1. Tehzeeb, Nazaakat & Urdu Poetry
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                The famous "Pehle Aap" (After You) etiquette embodies mutual respect and poetic grace. Lucknow was the cradle of polished Urdu poetry (Shayari), the birthplace of Marsiya traditions, and classical Kathak dance fostered in the royal courts of Nawab Wajid Ali Shah.
              </p>
            </div>

            {/* Pillar 2: Gastronomy */}
            <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-900 flex items-center justify-center">
                <Utensils className="w-6 h-6 text-red-700" />
              </div>
              <h3 className="text-xl font-bold font-serif-heading text-stone-900">
                2. Awadhi Gastronomy & Dum Cooking
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Awadhi cuisine is art elevated to perfection. The technique of "Dum Pukht" (slow-cooking in dough-sealed handis) ensures that aroma and spices marry with unmatched tenderness. From Galawati kebabs made with 160 secret herbs to saffron-infused Sheermal and winter Makhan Malai.
              </p>
            </div>

            {/* Pillar 3: Chikankari Craft */}
            <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-900 flex items-center justify-center">
                <Scissors className="w-6 h-6 text-pink-700" />
              </div>
              <h3 className="text-xl font-bold font-serif-heading text-stone-900">
                3. Chikankari, Zari & Attar Artisans
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Introduced by Mughal Empress Noor Jahan, Chikankari is the delicate white-on-white shadow embroidery comprising 32 specialized hand stitches. Paired with pure Shamama and Mitti attar distilled in copper degs, Lucknow remains India’s textile craftsmanship capital.
              </p>
            </div>

            {/* Pillar 4: Architecture */}
            <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                <Landmark className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-xl font-bold font-serif-heading text-stone-900">
                4. Lakhnawi Brick & Vault Architecture
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Awadhi architecture replaced heavy marble with ultra-thin, durable baked Lakhori bricks and luminous lime-shell stucco. Vaulted halls like the Bara Imambara stand miraculously without iron beams or central pillars, defying gravity for nearly 250 years.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Historic Heritage Zones */}
        <div className="bg-[#F5EFE6] rounded-3xl p-8 sm:p-12 border border-stone-300/80">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-heading text-stone-900 mb-6">
            Famous Heritage Quarters of Lucknow
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <h4 className="font-bold text-base text-amber-900">Old Chowk</h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                The ancient medieval bazaar of havelis, 1905 Tunday Kababi, perfumers, silversmiths, and Phoolwali Gali.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <h4 className="font-bold text-base text-amber-900">Hussainabad</h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                The royal monument corridor housing Bara Imambara, Rumi Darwaza, Chota Imambara, and Clock Tower.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <h4 className="font-bold text-base text-amber-900">Hazratganj</h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                The 1810 Victorian shopping boulevard famous for evening "Ganjing", Royal Cafe chaat, and bookstores.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <h4 className="font-bold text-base text-amber-900">Gomti Nagar</h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                The modern urban expanse featuring Asia’s largest eco-park, Ambedkar Memorial, and riverfront promenade.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-6">
          <button
            onClick={() => onNavigate('/explore')}
            className="px-8 py-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm sm:text-base shadow-lg transition-all"
          >
            Start Your Safar Through Lucknow →
          </button>
        </div>
      </div>
    </div>
  );
};
