import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  View,
} from "react-native";

import AddAddressModal from "@/components/Addresses/AddAddressModal";
import AddressCard from "@/components/Addresses/AddressCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemedButton from "@/components/ui/ThemedButton";
import { useAddressApi } from "@/hooks/useAddressApi";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  AddressUpdateRequestType,
  AddressRequestType,
} from "@/services/addressApi";

export default function AddressesScreen() {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const {
    addresses,
    loading,
    error,
    refetch,
    deleteAddress,
    addAddress,
    updateAddress,
    deletingAddresses,
    updatingAddresses,
  } = useAddressApi();

  // Colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const errorColor = useThemeColor({}, "error", "500");

  const handleAddAddress = async (
    addressData: AddressRequestType,
  ): Promise<boolean> => {
    return await addAddress(addressData);
  };

  const handleDeleteAddress = async (addressId: string): Promise<boolean> => {
    return await deleteAddress(addressId);
  };

  const handleUpdateAddress = async (
    addressId: string,
    addressData: AddressUpdateRequestType,
  ): Promise<boolean> => {
    return await updateAddress(addressId, addressData);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  if (loading && addresses.length === 0) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: textColor }]}>
            Adresy
          </ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={[styles.loadingText, { color: textColor }]}>
            Ładowanie adresów...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          Adresy
        </ThemedText>
        <ThemedButton
          title="Dodaj Adres"
          variant="filled"
          size="medium"
          color="primary"
          onPress={() => setIsAddModalVisible(true)}
        />
      </View>

      {error && (
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: errorColor + "20" },
          ]}
        >
          <ThemedText style={[styles.errorText, { color: errorColor }]}>
            {error}
          </ThemedText>
          <ThemedButton
            title="Ponów"
            variant="outline"
            size="small"
            color="error"
            onPress={handleRefresh}
          />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={primaryColor}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
              Nie masz jeszcze adresów
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: textColor + "80" }]}>
              Dodaj pierwszy adres, aby rozpocząć
            </ThemedText>
            <ThemedButton
              title="Dodaj Adres"
              variant="filled"
              size="large"
              color="primary"
              onPress={() => setIsAddModalVisible(true)}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <View style={styles.addressesContainer}>
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onDelete={handleDeleteAddress}
                onUpdate={handleUpdateAddress}
                isDeleting={deletingAddresses.has(address.id)}
                isUpdating={updatingAddresses.has(address.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <AddAddressModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSubmit={handleAddAddress}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60, // Account for status bar
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    marginRight: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 8,
  },
  addressesContainer: {
    paddingTop: 8,
  },
});
