import { useState, useEffect, useCallback } from "react";

import {
  addressApi,
  AddressType,
  AddressRequestType,
  AddressUpdateRequestType,
} from "@/services/addressApi";
import { ApiClientError } from "@/services/api";

export interface UseAddressApiState {
  addresses: AddressType[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteAddress: (addressId: string) => Promise<boolean>;
  addAddress: (addressData: AddressRequestType) => Promise<boolean>;
  updateAddress: (
    addressId: string,
    addressData: AddressUpdateRequestType,
  ) => Promise<boolean>;
  deletingAddresses: Set<string>;
  updatingAddresses: Set<string>;
}

export function useAddressApi(
  fetchOnRender: boolean = true,
): UseAddressApiState {
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingAddresses, setDeletingAddresses] = useState<Set<string>>(
    new Set(),
  );
  const [updatingAddresses, setUpdatingAddresses] = useState<Set<string>>(
    new Set(),
  );

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await addressApi.getAddresses();
      if (response.success && response.data) {
        setAddresses(response.data);
      } else {
        setError(response.message || "Failed to load addresses");
      }
    } catch (err) {
      const apiError = err as ApiClientError;

      // Provide user-friendly error messages
      let errorMessage = "Failed to load addresses";

      if (apiError.code === "NETWORK_ERROR") {
        errorMessage = "No internet connection. Please check your network.";
      } else if (apiError.code === "TIMEOUT") {
        errorMessage = "Request timed out. Please try again.";
      } else if (apiError.status === 401) {
        errorMessage = "Authentication required. Please log in.";
      } else if (apiError.status === 403) {
        errorMessage = "Access denied. You don't have permission.";
      } else if (apiError.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      setError(errorMessage);
      console.error("Addresses fetch error:", apiError);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAddress = useCallback(
    async (addressId: string): Promise<boolean> => {
      try {
        // Add to deleting set for loading state
        setDeletingAddresses((prev) => new Set(prev).add(addressId));
        setError(null);

        const result = await addressApi.deleteAddress(addressId);

        if (!result) {
          setError("Failed to delete address");
          return false;
        }
        // Optimistically update local state
        setAddresses((prevAddresses) =>
          prevAddresses.filter((address) => address.id !== addressId),
        );
        // Refresh the address list to ensure data consistency
        await fetchAddresses();
        return true;
      } catch (err) {
        const apiError = err as ApiClientError;

        let errorMessage = "Failed to delete address";

        if (apiError.code === "NETWORK_ERROR") {
          errorMessage = "No internet connection. Changes not saved.";
        } else if (apiError.status === 409) {
          errorMessage = "Address data was changed. Refreshing...";
          // Refresh data on conflict
          fetchAddresses();
        }

        setError(errorMessage);
        console.error("Address deletion error:", apiError);
        return false;
      } finally {
        // Remove from deleting set
        setDeletingAddresses((prev) => {
          const newSet = new Set(prev);
          newSet.delete(addressId);
          return newSet;
        });
      }
    },
    [fetchAddresses],
  );

  const addAddress = useCallback(
    async (addressData: AddressRequestType): Promise<boolean> => {
      try {
        setError(null);

        const result = await addressApi.addAddress(addressData);

        if (result) {
          // Refresh the address list to get the updated data with the new address
          await fetchAddresses();
          return true;
        } else {
          setError("Failed to create address");
          return false;
        }
      } catch (err) {
        const apiError = err as ApiClientError;

        let errorMessage = "Failed to create address";

        if (apiError.code === "NETWORK_ERROR") {
          errorMessage = "No internet connection. Address not created.";
        } else if (apiError.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }

        setError(errorMessage);
        console.error("Address creation error:", apiError);
        return false;
      }
    },
    [fetchAddresses],
  );

  const updateAddress = useCallback(
    async (
      addressId: string,
      addressData: AddressUpdateRequestType,
    ): Promise<boolean> => {
      try {
        // Add to updating set for loading state
        setUpdatingAddresses((prev) => new Set(prev).add(addressId));
        setError(null);

        const result = await addressApi.updateAddress(addressId, addressData);

        if (result.success && result.data) {
          // Optimistic update of local state
          setAddresses((prevAddresses) =>
            prevAddresses.map((address) => {
              if (address.id === addressId) {
                return {
                  ...address,
                  ...addressData,
                };
              }
              return address;
            }),
          );
          return true;
        } else {
          setError(result.message || "Failed to update address");
          return false;
        }
      } catch (err) {
        const apiError = err as ApiClientError;

        let errorMessage = "Failed to update address";

        if (apiError.code === "NETWORK_ERROR") {
          errorMessage = "No internet connection. Changes not saved.";
        } else if (apiError.status === 409) {
          errorMessage = "Address data was changed. Refreshing...";
          // Refresh data on conflict
          fetchAddresses();
        }

        setError(errorMessage);
        console.error("Address update error:", apiError);
        return false;
      } finally {
        // Remove from updating set
        setUpdatingAddresses((prev) => {
          const newSet = new Set(prev);
          newSet.delete(addressId);
          return newSet;
        });
      }
    },
    [fetchAddresses],
  );

  // Initial data fetch
  useEffect(() => {
    if (!fetchOnRender) return;
    fetchAddresses();
  }, [fetchOnRender, fetchAddresses]);

  return {
    addresses,
    loading,
    error,
    refetch: fetchAddresses,
    deleteAddress,
    addAddress,
    updateAddress,
    deletingAddresses,
    updatingAddresses,
  };
}
