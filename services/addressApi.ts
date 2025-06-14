import { ApiClientError, ApiResponse, apiRequest } from "@/services/api";

export type AddressDTO = {
  ExternalId: string;
  AddressName: string;
  AddressData: string; // City, Street, HouseNumber
};

export type AddressType = {
  id: string;
  name: string;
  data: string;
};

export function addressConverter(addressDTO: AddressDTO): AddressType {
  return {
    id: addressDTO.ExternalId,
    name: addressDTO.AddressName,
    data: addressDTO.AddressData,
  };
}

export const addressApi = {
  async getAddresses(): Promise<ApiResponse<AddressType[]>> {
    try {
      const response = await apiRequest<AddressDTO[]>("/addresses");
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
      const response = await apiRequest<AddressDTO>(`/addresses/${id}`);
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
