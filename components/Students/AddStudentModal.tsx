import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { AddressType, addressApi } from "@/services/addressApi";
import { StudentType } from "@/services/studentApi";

type AddStudentModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (studentData: Omit<StudentType, "id">) => Promise<boolean>;
};

const AddStudentModal = ({
  visible,
  onClose,
  onSubmit,
}: AddStudentModalProps) => {
  // State for form fields
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");

  // State for data loading
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Colors
  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");

  // Load data when modal opens
  useEffect(() => {
    if (visible) {
      loadData();
      resetForm();
    }
  }, [visible]);

  const loadData = async () => {
    setLoading(true);
    try {
      const addressesResponse = await addressApi.getAddresses();
      if (addressesResponse.success && addressesResponse.data) {
        setAddresses(addressesResponse.data);
      } else {
        // Fallback with mock data
        const mockAddress: AddressType = {
          id: "1",
          name: "Default Address",
          data: "123 Main St, City, Country",
        };
        setAddresses([mockAddress]);
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
      // Fallback with mock data
      const mockAddress: AddressType = {
        id: "1",
        name: "Default Address",
        data: "123 Main St, City, Country",
      };
      setAddresses([mockAddress]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setSurname("");
    setSelectedAddressId("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): string | null => {
    if (!name.trim()) return "Name is required";
    if (!surname.trim()) return "Surname is required";
    if (!selectedAddressId) return "Address is required";

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert("Validation Error", validationError);
      return;
    }

    setSubmitting(true);
    try {
      const selectedAddress = addresses.find(
        (addr) => addr.id === selectedAddressId,
      );
      if (!selectedAddress) {
        Alert.alert("Error", "Selected address not found");
        return;
      }

      const studentData: Omit<StudentType, "id"> = {
        name: name.trim(),
        surname: surname.trim(),
        address: selectedAddress,
      };

      const success = await onSubmit(studentData);
      if (success) {
        Alert.alert("Success", "Student created successfully");
        handleClose();
      } else {
        Alert.alert("Error", "Failed to create student");
      }
    } catch (error) {
      console.error("Failed to submit student:", error);
      Alert.alert("Error", "Failed to create student");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={[styles.header, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.title}>Add New Student</ThemedText>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: primaryColor }]}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
            <ThemedText style={styles.loadingText}>Loading data...</ThemedText>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  Name
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: primaryColor },
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter student's name"
                  placeholderTextColor={textColor + "80"}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  Surname
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: primaryColor },
                  ]}
                  value={surname}
                  onChangeText={setSurname}
                  placeholder="Enter student's surname"
                  placeholderTextColor={textColor + "80"}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  Address
                </ThemedText>
                <View style={styles.addressContainer}>
                  {addresses.map((address) => (
                    <TouchableOpacity
                      key={address.id}
                      style={[
                        styles.addressItem,
                        {
                          borderColor: primaryColor,
                          backgroundColor:
                            selectedAddressId === address.id
                              ? primaryColor + "20"
                              : "transparent",
                        },
                      ]}
                      onPress={() => setSelectedAddressId(address.id)}
                    >
                      <View style={styles.addressInfo}>
                        <ThemedText
                          style={[styles.addressName, { color: textColor }]}
                        >
                          {address.name}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.addressData,
                            { color: textColor + "80" },
                          ]}
                        >
                          {address.data}
                        </ThemedText>
                      </View>
                      {selectedAddressId === address.id && (
                        <Text
                          style={[styles.checkmark, { color: primaryColor }]}
                        >
                          ✓
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: primaryColor },
                  (submitting ||
                    !name.trim() ||
                    !surname.trim() ||
                    !selectedAddressId) &&
                    styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={
                  submitting ||
                  !name.trim() ||
                  !surname.trim() ||
                  !selectedAddressId
                }
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Create Student</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
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
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "transparent",
  },
  addressContainer: {
    gap: 8,
  },
  addressItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
  },
  addressData: {
    fontSize: 14,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: "bold",
  },
  submitButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default AddStudentModal;
