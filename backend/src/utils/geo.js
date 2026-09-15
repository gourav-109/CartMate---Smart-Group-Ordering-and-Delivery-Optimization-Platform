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
 * Default fallback to NIT Jamshedpur [86.1438, 22.7780].
 */
export const calculateGeographicMidpoint = (coordsArray) => {
  if (!coordsArray || coordsArray.length === 0) {
    return [86.1438, 22.7780]; // Default fallback: NIT Jamshedpur
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
 * Calculates proportional fee split according to the verified formula:
 * Share_i = MRP_i / Sum(MRP)
 * FinalPayment_i = Share_i * combinedOrderTotal
 * Savings_i = standaloneTotal_i - FinalPayment_i
 * 
 * Accurately preserves populated Mongoose subdocument fields (user name, id, customId).
 */
export const calculateProportionalSplit = (participants, combinedOrderTotal) => {
  if (!Array.isArray(participants)) return [];

  const rawParticipants = participants.map((p) => {
    if (p && typeof p.toObject === 'function') {
      return p.toObject();
    }
    if (p && p._doc) {
      return { ...p._doc, user: p.user };
    }
    return { ...p };
  });

  const totalCombinedMrp = rawParticipants.reduce((sum, p) => sum + (p.totalMrp || 0), 0);

  if (totalCombinedMrp === 0) return rawParticipants;

  return rawParticipants.map((participant) => {
    const shareRatio = (participant.totalMrp || 0) / totalCombinedMrp;
    const finalPaymentRaw = shareRatio * (combinedOrderTotal || 0);
    const finalPayment = Math.round(finalPaymentRaw * 100) / 100;
    const savings = Math.round(((participant.standaloneTotal || 0) - finalPayment) * 100) / 100;

    return {
      ...participant,
      shareRatio: Math.round(shareRatio * 10000) / 10000,
      finalPayment,
      savings
    };
  });
};

/**
 * Calculates proportional share, final payment, and net savings per member dynamically
 * whenever a member joins or leaves. Updates both itemMRP/totalMrp, standaloneTotalAlone/standaloneTotal,
 * and paymentStatus.
 */
export const calculateGroupSplit = (members, combinedCheckoutTotal) => {
  if (!Array.isArray(members)) return [];

  const rawMembers = members.map((m) => {
    if (m && typeof m.toObject === 'function') {
      return m.toObject();
    }
    if (m && m._doc) {
      return { ...m._doc, user: m.user };
    }
    return { ...m };
  });

  const totalGroupMRP = rawMembers.reduce((sum, m) => {
    const mrp = m.itemMRP !== undefined ? m.itemMRP : (m.totalMrp || 0);
    return sum + mrp;
  }, 0);

  if (totalGroupMRP === 0) return rawMembers;

  return rawMembers.map((member) => {
    const mrp = member.itemMRP !== undefined ? member.itemMRP : (member.totalMrp || 0);
    const standalone = member.standaloneTotalAlone !== undefined ? member.standaloneTotalAlone : (member.standaloneTotal || 0);

    const sharePct = (mrp / totalGroupMRP) * 100;
    const finalPaymentRaw = (sharePct / 100) * (combinedCheckoutTotal || 0);
    const finalPayment = Math.round(finalPaymentRaw * 100) / 100;
    const savings = Math.round((standalone - finalPayment) * 100) / 100;

    return {
      ...member,
      itemMRP: mrp,
      totalMrp: mrp,
      standaloneTotalAlone: standalone,
      standaloneTotal: standalone,
      shareRatio: Math.round((sharePct / 100) * 10000) / 10000,
      sharePct: Math.round(sharePct * 10) / 10,
      finalPayment,
      savings,
      settled: member.settled || member.paymentStatus === 'PAID',
      paymentStatus: (member.settled || member.paymentStatus === 'PAID') ? 'PAID' : 'PENDING'
    };
  });
};

