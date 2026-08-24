import { DayPlanRequest, ItineraryResult, ItineraryStop, Place } from '../types';
import { PlaceService } from './placeService';

export const ItineraryService = {
  generateDayPlan(request: DayPlanRequest): ItineraryResult {
    const allPlaces = PlaceService.getPublishedPlaces();
    
    // Categorize candidates
    const heritagePlaces = allPlaces.filter(p => p.category === 'historical' || p.category === 'landmarks');
    const foodPlaces = allPlaces.filter(p => p.category === 'food');
    const shoppingPlaces = allPlaces.filter(p => p.category === 'shopping');
    const relaxPlaces = allPlaces.filter(p => p.category === 'parks' || p.vibes.includes('Peaceful') || p.vibes.includes('Sunset') || p.category === 'hidden-gems');
    const culturePlaces = allPlaces.filter(p => p.category === 'culture' || p.category === 'experiences');

    // Score based on selected vibes & budget
    const scorePlace = (place: Place): number => {
      let score = 10;
      if (place.featured) score += 15;
      if (place.rating) score += place.rating * 4;
      
      // Match vibes
      request.vibes.forEach(v => {
        if (place.vibes.includes(v)) score += 20;
      });

      // Match categories
      if (request.categories.includes(place.category)) score += 25;

      // Budget friendliness
      if (place.estimatedBudget <= request.budgetPerPerson / 2) score += 10;
      return score;
    };

    const sortByScore = (list: Place[]) => [...list].sort((a, b) => scorePlace(b) - scorePlace(a));

    const topHeritage = sortByScore(heritagePlaces)[0] || allPlaces[0];
    const topFood1 = sortByScore(foodPlaces)[0] || allPlaces[4];
    const topShoppingOrCulture = sortByScore([...shoppingPlaces, ...culturePlaces])[0] || allPlaces[5];
    const topSunset = sortByScore(relaxPlaces.filter(p => p.id !== topHeritage.id))[0] || allPlaces[6];
    const topFood2 = sortByScore(foodPlaces.filter(p => p.id !== topFood1.id))[0] || allPlaces[13] || allPlaces[4];

    const stops: ItineraryStop[] = [];
    const hours = request.durationHours;

    if (request.startTiming === 'morning') {
      if (hours >= 3) {
        stops.push({
          timeSlot: '09:30 AM – 11:30 AM',
          place: topHeritage,
          activityHint: `Explore royal Awadhi architecture at ${topHeritage.name}. Take morning photos and explore courtyards.`,
          estimatedExpense: topHeritage.estimatedBudget,
          durationMins: 120,
          travelTips: topHeritage.howToReach.autoCabTips || 'E-rickshaws readily available'
        });

        stops.push({
          timeSlot: '12:00 PM – 01:30 PM',
          place: topFood1,
          activityHint: `Lunch break & authentic Lucknow feast at ${topFood1.name}. Try signature house specialties.`,
          estimatedExpense: topFood1.estimatedBudget,
          durationMins: 90
        });
      }

      if (hours >= 6) {
        stops.push({
          timeSlot: '02:00 PM – 04:00 PM',
          place: topShoppingOrCulture,
          activityHint: `Cultural browsing and authentic shopping at ${topShoppingOrCulture.name}.`,
          estimatedExpense: topShoppingOrCulture.estimatedBudget,
          durationMins: 120
        });
      }

      if (hours >= 8) {
        stops.push({
          timeSlot: '04:30 PM – 06:30 PM',
          place: topSunset,
          activityHint: `Golden hour sunset stroll & tranquil breeze at ${topSunset.name}.`,
          estimatedExpense: topSunset.estimatedBudget,
          durationMins: 120
        });

        stops.push({
          timeSlot: '07:30 PM – 09:30 PM',
          place: topFood2,
          activityHint: `Evening dessert, dinner & vibrant nightlife at ${topFood2.name}.`,
          estimatedExpense: topFood2.estimatedBudget,
          durationMins: 120
        });
      }
    } else if (request.startTiming === 'afternoon') {
      stops.push({
        timeSlot: '01:30 PM – 03:00 PM',
        place: topFood1,
        activityHint: `Start with a sumptuous Awadhi meal at ${topFood1.name}.`,
        estimatedExpense: topFood1.estimatedBudget,
        durationMins: 90
      });

      stops.push({
        timeSlot: '03:30 PM – 05:30 PM',
        place: topHeritage,
        activityHint: `Heritage monument exploration and architecture photography at ${topHeritage.name}.`,
        estimatedExpense: topHeritage.estimatedBudget,
        durationMins: 120
      });

      if (hours >= 5) {
        stops.push({
          timeSlot: '06:00 PM – 08:00 PM',
          place: topSunset,
          activityHint: `Sunset breeze, fountain displays, and relaxation at ${topSunset.name}.`,
          estimatedExpense: topSunset.estimatedBudget,
          durationMins: 120
        });
      }

      if (hours >= 7) {
        stops.push({
          timeSlot: '08:30 PM – 10:00 PM',
          place: topShoppingOrCulture,
          activityHint: `Evening shopping and street food hop at ${topShoppingOrCulture.name}.`,
          estimatedExpense: topShoppingOrCulture.estimatedBudget,
          durationMins: 90
        });
      }
    } else {
      // Evening
      stops.push({
        timeSlot: '04:00 PM – 06:00 PM',
        place: topSunset,
        activityHint: `Catch the golden sunset vista at ${topSunset.name}.`,
        estimatedExpense: topSunset.estimatedBudget,
        durationMins: 120
      });

      stops.push({
        timeSlot: '06:30 PM – 08:30 PM',
        place: topShoppingOrCulture,
        activityHint: `Vibrant evening bazaar exploration and shopping at ${topShoppingOrCulture.name}.`,
        estimatedExpense: topShoppingOrCulture.estimatedBudget,
        durationMins: 120
      });

      stops.push({
        timeSlot: '09:00 PM – 10:30 PM',
        place: topFood1,
        activityHint: `Classic late-night Lucknow dinner & desserts at ${topFood1.name}.`,
        estimatedExpense: topFood1.estimatedBudget,
        durationMins: 90
      });
    }

    const totalBudget = stops.reduce((sum, s) => sum + s.estimatedExpense, 0);

    return {
      id: 'plan_' + Date.now(),
      title: `${hours}-Hour Curated Lucknow ${request.vibes[0] || 'Heritage'} Experience`,
      totalBudget,
      totalDurationHours: hours,
      stops,
      summary: `A carefully balanced ${hours}-hour itinerary curated for ₹${totalBudget} budget, covering ${stops.length} iconic and authentic destinations across Lucknow.`,
      createdAt: new Date().toISOString()
    };
  }
};
