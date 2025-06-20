import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemedButton from "@/components/ui/ThemedButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { AddressType, addressApi } from "@/services/addressApi";
import { StudentType, StudentUpdateRequestType } from "@/services/studentApi";
import alert from "@/utils/alert";

type EditStudentModalProps = {
  visible: boolean;
  student: StudentType | null;
  onClose: () => void;
  onSubmit: (
    studentId: string,
    studentData: StudentUpdateRequestType,
  ) => Promise<boolean>;
};

const EditStudentModal = ({
  visible,
  student,
  onClose,
  onSubmit,
}: EditStudentModalProps) => {
  // State for form fields
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [editMode, setEditMode] = useState<"existing" | "new">("existing");

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
    if (visible && student) {
      setName(student.name);
      setSurname(student.surname);
      setSelectedAddressId(student.address.id);
      setEditMode("existing");
      loadData();
    }
  }, [visible, student]);

  const loadData = async () => {
    try {
      setLoading(true);
      const addressesResponse = await addressApi.getAddresses();
      if (addressesResponse.success && addressesResponse.data) {
        setAddresses(addressesResponse.data);
      }
    } catch (error) {
      alert(
        "Error",
        "Failed to load addresses" +
          (error instanceof Error ? `: ${error.message}` : ""),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!student) return;

    if (!name.trim() || !surname.trim()) {
      alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      const updateData: StudentUpdateRequestType = {};

      // Only include fields that have changed
      if (name !== student.name) {
        updateData.name = name;
      }
      if (surname !== student.surname) {
        updateData.surname = surname;
      }

      // Handle address update
      if (editMode === "existing" && selectedAddressId !== student.address.id) {
        updateData.address = { id: selectedAddressId };
      } else if (editMode === "new") {
        // For simplicity, we'll use the selected address name and current data
        const selectedAddress = addresses.find(
          (addr) => addr.id === selectedAddressId,
        );
        if (selectedAddress) {
          updateData.address = {
            name: selectedAddress.name,
            data: student.address.data, // Keep existing data unless modified
          };
        }
      }

      // Only submit if there are actual changes
      if (Object.keys(updateData).length === 0) {
        alert("Info", "No changes to save");
        return;
      }

      const success = await onSubmit(student.id, updateData);

      if (success) {
        handleClose();
      }
    } catch (error) {
      alert(
        "Error",
        "Failed to update student" +
          (error instanceof Error ? `: ${error.message}` : ""),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setSurname("");
    setSelectedAddressId("");
    setEditMode("existing");
    onClose();
  };

  if (!student) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <ThemedView style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedButton
            title="Cancel"
            variant="outline"
            size="small"
            color="primary"
            onPress={handleClose}
            style={styles.headerButton}
          />
          <ThemedText style={[styles.title, { color: textColor }]}>
            Edit Student
          </ThemedText>
          <ThemedButton
            title="Save"
            variant="filled"
            size="small"
            color="primary"
            loading={submitting}
            disabled={submitting}
            onPress={handleSubmit}
            style={styles.headerButton}
          />
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={primaryColor} />
              <ThemedText style={[styles.loadingText, { color: textColor }]}>
                Loading...
              </ThemedText>
            </View>
          ) : (
            <>
              {/* Basic Info */}
              <ThemedView
                style={[styles.section, { backgroundColor: surfaceColor }]}
              >
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  Student Information
                </ThemedText>

                <View style={styles.field}>
                  <ThemedText style={[styles.label, { color: textColor }]}>
                    First Name *
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      { color: textColor, borderColor: textColor + "20" },
                    ]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter first name"
                    placeholderTextColor={textColor + "60"}
                  />
                </View>

                <View style={styles.field}>
                  <ThemedText style={[styles.label, { color: textColor }]}>
                    Last Name *
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      { color: textColor, borderColor: textColor + "20" },
                    ]}
                    value={surname}
                    onChangeText={setSurname}
                    placeholder="Enter last name"
                    placeholderTextColor={textColor + "60"}
                  />
                </View>
              </ThemedView>

              {/* Address Section */}
              <ThemedView
                style={[styles.section, { backgroundColor: surfaceColor }]}
              >
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                  Address
                </ThemedText>

                <View style={styles.addressModeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      editMode === "existing" && {
                        backgroundColor: primaryColor + "20",
                      },
                    ]}
                    onPress={() => setEditMode("existing")}
                  >
                    <ThemedText
                      style={[
                        styles.modeButtonText,
                        {
                          color:
                            editMode === "existing"
                              ? primaryColor
                              : textColor + "80",
                        },
                      ]}
                    >
                      Use Existing
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      editMode === "new" && {
                        backgroundColor: primaryColor + "20",
                      },
                    ]}
                    onPress={() => setEditMode("new")}
                  >
                    <ThemedText
                      style={[
                        styles.modeButtonText,
                        {
                          color:
                            editMode === "new"
                              ? primaryColor
                              : textColor + "80",
                        },
                      ]}
                    >
                      Create New
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                <View style={styles.field}>
                  <ThemedText style={[styles.label, { color: textColor }]}>
                    Current Address: {student.address.name}
                  </ThemedText>
                  <ThemedText
                    style={[styles.addressData, { color: textColor + "60" }]}
                  >
                    {student.address.data}
                  </ThemedText>
                </View>

                {editMode === "existing" && (
                  <View style={styles.field}>
                    <ThemedText style={[styles.label, { color: textColor }]}>
                      Select Address
                    </ThemedText>
                    <ScrollView style={styles.addressList} nestedScrollEnabled>
                      {addresses.map((address) => (
                        <TouchableOpacity
                          key={address.id}
                          style={[
                            styles.addressItem,
                            selectedAddressId === address.id && {
                              backgroundColor: primaryColor + "20",
                            },
                          ]}
                          onPress={() => setSelectedAddressId(address.id)}
                        >
                          <ThemedText
                            style={[styles.addressName, { color: textColor }]}
                          >
                            {address.name}
                          </ThemedText>
                          <ThemedText
                            style={[
                              styles.addressData,
                              { color: textColor + "60" },
                            ]}
                          >
                            {address.data}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </ThemedView>
            </>
          )}
        </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#00000010",
  },
  headerButton: {
    minWidth: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  section: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addressModeContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  modeButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00000010",
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  addressList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#00000010",
    borderRadius: 8,
  },
  addressItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#00000010",
  },
  addressName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  addressData: {
    fontSize: 14,
  },
});

export default EditStudentModal;
