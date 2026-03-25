import NodeCache from "node-cache";

export const recommendationCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
