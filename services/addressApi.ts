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

export type AddressRequestType = {
  name: string;
  data: string;
};

export type AddressUpdateRequestType = {
  name?: string;
  data?: string;
};

type AddressRequestDTO = {
  addressName: string;
  addressData: string;
};

type AddressUpdateRequestDTO = {
  AddressName?: string;
  AddressData?: string;
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

function addressRequestConverter(
  addressRequest: AddressRequestType,
): AddressRequestDTO {
  return {
    addressName: addressRequest.name,
    addressData: addressRequest.data,
  };
}

function addressUpdateRequestConverter(
  addressUpdateRequest: AddressUpdateRequestType,
): AddressUpdateRequestDTO {
  const dto: AddressUpdateRequestDTO = {};

  if (addressUpdateRequest.name !== undefined) {
    dto.AddressName = addressUpdateRequest.name;
  }

  if (addressUpdateRequest.data !== undefined) {
    dto.AddressData = addressUpdateRequest.data;
  }

  return dto;
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

  async addAddress(addressData: AddressRequestType): Promise<boolean> {
    try {
      const response = await apiRequest<string>("/address", {
        method: "POST",
        body: JSON.stringify(addressRequestConverter(addressData)),
      });

      return response === "";
    } catch (error) {
      if (error instanceof ApiClientError) {
        console.error("Failed to add address:", error.message);
        return false;
      }
      throw error; // Re-throw unexpected errors
    }
  },

  async deleteAddress(id: string): Promise<boolean> {
    try {
      const response = await apiRequest<string>(`/address/${id}`, {
        method: "DELETE",
      });

      return response === "";
    } catch (error) {
      if (error instanceof ApiClientError) {
        console.error("Failed to delete address:", error.message);
        return false;
      }
      throw error; // Re-throw unexpected errors
    }
  },

  async updateAddress(
    id: string,
    addressData: AddressUpdateRequestType,
  ): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiRequest<string>(`/address/${id}`, {
        method: "PATCH",
        body: JSON.stringify(addressUpdateRequestConverter(addressData)),
      });
      return { data: response === "", success: true };
    } catch (error) {
      if (error instanceof ApiClientError) {
        return { data: null, success: false, message: error.message };
      }
      throw error; // Re-throw unexpected errors
    }
  },
};
