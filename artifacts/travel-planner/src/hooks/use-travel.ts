/**
 * Clean abstraction layer wrapping the generated monorepo hooks
 * This satisfies the structural requirements while reusing the generated queries perfectly.
 */
import {
  useGenerateTravelPlan,
  useGetSavedTrips,
  useSaveTrip,
  useDeleteTrip,
  getGetSavedTripsQueryKey
} from "@workspace/api-client-react";

export {
  useGenerateTravelPlan,
  useGetSavedTrips,
  useSaveTrip,
  useDeleteTrip,
  getGetSavedTripsQueryKey
};
