import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import ThemedButton from "@/components/ui/ThemedButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { AddressType, AddressUpdateRequestType } from "@/services/addressApi";
import alert from "@/utils/alert";

import EditAddressModal from "./EditAddressModal";

type AddressCardProps = {
  address: AddressType;
  onDelete: (addressId: string) => Promise<boolean>;
  onUpdate: (
    addressId: string,
    addressData: AddressUpdateRequestType,
  ) => Promise<boolean>;
  isDeleting: boolean;
  isUpdating: boolean;
};

const AddressCard = ({
  address,
  onDelete,
  onUpdate,
  isDeleting,
  isUpdating,
}: AddressCardProps) => {
  const [showEditModal, setShowEditModal] = useState(false);

  const backgroundColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const errorColor = useThemeColor({}, "error", "500");

  const handleDelete = () => {
    alert(
      "Usuń Adres",
      `Czy na pewno chcesz usunąć adres "${address.name}"?`,
      [
        {
          text: "Anuluj",
          style: "cancel",
        },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            const success = await onDelete(address.id);
            if (!success) {
              alert("Błąd", "Nie udało się usunąć adresu");
            }
          },
        },
      ],
    );
  };

  const handleUpdate = async (
    addressId: string,
    addressData: AddressUpdateRequestType,
  ) => {
    const success = await onUpdate(addressId, addressData);
    if (!success) {
      alert("Błąd", "Nie udało się zaktualizować adresu");
    }
    return success;
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <ThemedText style={[styles.name, { color: primaryColor }]}>
              {address.name}
            </ThemedText>
          </View>
          <View style={styles.buttonContainer}>
            <ThemedButton
              variant="outline"
              size="small"
              color="primary"
              icon="pencil"
              loading={isUpdating}
              disabled={isUpdating || isDeleting}
              onPress={() => setShowEditModal(true)}
            />
            <TouchableOpacity
              onPress={handleDelete}
              disabled={isDeleting || isUpdating}
              style={[
                styles.deleteButton,
                (isDeleting || isUpdating) && styles.buttonDisabled,
              ]}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={errorColor} />
              ) : (
                <IconSymbol name="trash.fill" size={20} color={errorColor} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dataSection}>
          <ThemedText style={[styles.dataLabel, { color: textColor + "80" }]}>
            Dane adresu:
          </ThemedText>
          <ThemedText style={[styles.dataValue, { color: textColor }]}>
            {address.data || "Brak danych"}
          </ThemedText>
        </View>
      </View>

      <EditAddressModal
        visible={showEditModal}
        address={address}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdate}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
  },
  dataSection: {
    gap: 4,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  dataValue: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#ff000015",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default AddressCard;
