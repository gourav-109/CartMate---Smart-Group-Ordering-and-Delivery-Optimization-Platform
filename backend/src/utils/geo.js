/**
 * Haversine formula to calculate distance between two coordinates in kilometers.
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculates geographic midpoint of an array of [lng, lat] coordinate pairs.
 */
export const calculateGeographicMidpoint = (coordsArray) => {
  if (!coordsArray || coordsArray.length === 0) {
    return [77.6245, 12.9352]; // Default fallback
  }

  let totalLng = 0;
  let totalLat = 0;

  coordsArray.forEach(([lng, lat]) => {
    totalLng += lng;
    totalLat += lat;
  });

  const avgLng = Math.round((totalLng / coordsArray.length) * 10000) / 10000;
  const avgLat = Math.round((totalLat / coordsArray.length) * 10000) / 10000;

  return [avgLng, avgLat];
};

/**
 * Calculates proportional fee split according to the user's verified formula:
 * Share_i = MRP_i / Sum(MRP)
 * FinalPayment_i = Share_i * combinedOrderTotal
 * Savings_i = standaloneTotal_i - FinalPayment_i
 */
export const calculateProportionalSplit = (participants, combinedOrderTotal) => {
  const totalCombinedMrp = participants.reduce((sum, p) => sum + (p.totalMrp || 0), 0);

  if (totalCombinedMrp === 0) return participants;

  return participants.map((participant) => {
    const shareRatio = participant.totalMrp / totalCombinedMrp;
    const finalPaymentRaw = shareRatio * combinedOrderTotal;
    const finalPayment = Math.round(finalPaymentRaw * 100) / 100;
    const savings = Math.round((participant.standaloneTotal - finalPayment) * 100) / 100;

    return {
      ...participant,
      shareRatio: Math.round(shareRatio * 10000) / 10000,
      finalPayment,
      savings
    };
  });
};
