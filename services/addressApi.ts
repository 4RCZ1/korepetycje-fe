import { ApiClientError, ApiResponse, apiRequest } from "@/services/api";

export type AddressDTO = {
  externalId: string;
  addressName: string;
  addressData: string; // City, Street, HouseNumber
};

export type AddressType = {
  id: string;
  name: string;
  data: string;
};

export function addressConverter(addressDTO: AddressDTO | null): AddressType {
  if (addressDTO === null) {
    return {
      id: "",
      name: "",
      data: "",
    };
  }
  return {
    id: addressDTO.externalId,
    name: addressDTO.addressName,
    data: addressDTO.addressData,
  };
}

export const addressApi = {
  async getAddresses(): Promise<ApiResponse<AddressType[]>> {
    try {
      const response = await apiRequest<AddressDTO[]>("/address");
      const addresses = response.map(addressConverter);
      return { data: addresses, success: true };
    } catch (error) {
      if (error instanceof ApiClientError) {
        return { data: [], success: false, message: error.message };
      }
      throw error; // Re-throw unexpected errors
    }
  },

  async getAddressById(id: string): Promise<ApiResponse<AddressType>> {
    try {
      const response = await apiRequest<AddressDTO>(`/address/${id}`);
      const address = addressConverter(response);
      return { data: address, success: true };
    } catch (error) {
      if (error instanceof ApiClientError) {
        return { data: null, success: false, message: error.message };
      }
      throw error; // Re-throw unexpected errors
    }
  },
};
