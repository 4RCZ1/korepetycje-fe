import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator, RefreshControl, Text, Platform } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useScheduleApi } from '@/hooks/useScheduleApi';
import { ScheduleItem, WeekSchedule } from '@/services/api';

export default function HomeScreen() {
  const {
    scheduleData,
    loading,
    error,
    refetch,
    confirmMeeting,
    confirmingLessons,
  } = useScheduleApi();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    day: keyof WeekSchedule;
    itemIndex: number;
    item: ScheduleItem;
  } | null>(null);

  // State for screen dimensions that updates on rotation
  const [screenDimensions, setScreenDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  // State for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weekdayAbbr = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Calculate dynamic values based on current screen dimensions
  const columnWidth = (screenDimensions.width - 32) / 7; // 32 for padding
  const isLandscape = screenDimensions.width > screenDimensions.height;
  const columnHeight = isLandscape ? 300 : 400; // Adjust height based on orientation

  useEffect(() => {
    // Only enable rotation on native platforms, not web
    const setupOrientation = async () => {
      if (Platform.OS !== 'web') {
        try {
          // Enable rotation
          await ScreenOrientation.unlockAsync();
        } catch (error) {
          console.warn('Could not unlock screen orientation:', error);
        }
      }
    };

    setupOrientation();

    // Listen for dimension changes (rotation)
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions({ width: window.width, height: window.height });
    });

    // Listen for orientation changes for additional control if needed
    let orientationSubscription: any = null;

    if (Platform.OS !== 'web') {
      try {
        orientationSubscription = ScreenOrientation.addOrientationChangeListener(
          (event) => {
            // Force a re-render by updating dimensions
            const { width, height } = Dimensions.get('window');
            setScreenDimensions({ width, height });
          }
        );
      } catch (error) {
        console.warn('Could not add orientation change listener:', error);
      }
    }

    return () => {
      subscription?.remove();
      if (orientationSubscription && Platform.OS !== 'web') {
        try {
          ScreenOrientation.removeOrientationChangeListener(orientationSubscription);
        } catch (error) {
          console.warn('Could not remove orientation change listener:', error);
        }
      }
    };
  }, []);
;

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const calculatePosition = (yPos: number): number => {
    return (yPos / 100) * columnHeight;
  };

  const calculateHeight = (yPosStart: number, yPosEnd: number): number => {
    const startPos = calculatePosition(yPosStart);
    const endPos = calculatePosition(yPosEnd);
    return Math.abs(endPos - startPos);
  };

  const getTopPosition = (yPosStart: number, yPosEnd: number): number => {
    const startPos = calculatePosition(yPosStart);
    const endPos = calculatePosition(yPosEnd);
    return Math.min(startPos, endPos);
  };

  const getItemStyle = (confirmed?: boolean | null) => {
    if (confirmed === true) {
      return styles.scheduleItemConfirmed; // Current blue style
    } else if (confirmed === false) {
      return styles.scheduleItemRejected; // Grayed out
    } else {
      return styles.scheduleItemPending; // Lighter blue
    }
  };

  const getTextStyle = (confirmed?: boolean | null) => {
    if (confirmed === false) {
      return styles.scheduleTextRejected;
    }
    return styles.scheduleText;
  };

  const handleItemPress = (day: keyof WeekSchedule, itemIndex: number, item: ScheduleItem) => {
    if (item.confirmed === undefined || item.confirmed === null) {
      setSelectedItem({ day, itemIndex, item });
      setModalVisible(true);
    }
  };

  const handleConfirmation = async (confirmed: boolean) => {
    if (!selectedItem) return;

    const { item } = selectedItem;

    try {
      const success = await confirmMeeting(item.lessonId, confirmed);

      if (success) {
        setModalVisible(false);
        setSelectedItem(null);

        // Show success message
        Alert.alert(
          'Success',
          `Meeting has been ${confirmed ? 'confirmed' : 'rejected'}.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      // Error is already handled in the hook and displayed in the UI
      // We can show additional alert for better UX
      Alert.alert(
        'Error',
        'Failed to update meeting status. Please try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => handleConfirmation(confirmed) },
        ]
      );
    }
  };

  const getConfirmationStatus = (confirmed?: boolean | null) => {
    if (confirmed === true) return "✓ Confirmed";
    if (confirmed === false) return "✗ Rejected";
    return "? Pending";
  };

  const renderColumn = (dayKey: keyof WeekSchedule, columnIndex: number) => {
    if (!scheduleData) return null;

    const daySchedule = scheduleData[dayKey];

    return (
      <View key={dayKey} style={[styles.column, { width: columnWidth }]}>
        {/* Day header */}
        <View style={styles.dayHeader}>
          <ThemedText style={styles.dayText}>{weekdayAbbr[columnIndex]}</ThemedText>
        </View>

        {/* Schedule container with fixed height for percentage calculations */}
        <View style={[styles.scheduleContainer, { height: columnHeight }]}>
          {/* Background grid lines for visualization (optional) */}
          {[0, 25, 50, 75, 100].map(percentage => (
            <View
              key={percentage}
              style={[
                styles.gridLine,
                {
                  top: calculatePosition(percentage),
                  width: columnWidth - 4,
                }
              ]}
            />
          ))}

          {/* Schedule items */}
          {daySchedule.map((item, itemIndex) => {
            const top = getTopPosition(item.yPosStart, item.yPosEnd);
            const height = calculateHeight(item.yPosStart, item.yPosEnd);
            const isPending = item.confirmed === undefined || item.confirmed === null;
            const isConfirming = confirmingLessons.has(item.lessonId);

            const rectangleStyle = {
              top: top,
              width: columnWidth - 4,
              height: height,
            };

            const ItemComponent = isPending && !isConfirming ? TouchableOpacity : View;

            return (
              <ItemComponent
                key={itemIndex}
                style={[
                  styles.scheduleItem,
                  getItemStyle(item.confirmed),
                  rectangleStyle,
                  isConfirming && styles.scheduleItemLoading,
                ]}
                onPress={isPending && !isConfirming ? () => handleItemPress(dayKey, itemIndex, item) : undefined}
                activeOpacity={isPending && !isConfirming ? 0.7 : 1}
              >
                {isConfirming ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <ThemedText style={[styles.scheduleText, getTextStyle(item.confirmed)]} numberOfLines={2}>
                      {item.text}
                    </ThemedText>
                    <ThemedText style={[styles.positionText, getTextStyle(item.confirmed)]}>
                      {item.yPosStart}%-{item.yPosEnd}%
                    </ThemedText>
                    <ThemedText style={[styles.statusText, getTextStyle(item.confirmed)]}>
                      {getConfirmationStatus(item.confirmed)}
                    </ThemedText>
                  </>
                )}
              </ItemComponent>
            );
          })}
        </View>

        {/* Column border */}
        <View style={styles.columnBorder} />
      </View>
    );
  };

  // Loading state
  if (loading && !scheduleData) {
    return (
      <ParallaxScrollView headerBackgroundColor={{light: '#A1CEDC', dark: '#1D3D47'}}>
        <ThemedView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <ThemedText style={styles.loadingText}>Loading schedule...</ThemedText>
          </View>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  // Error state
  if (error && !scheduleData) {
    return (
      <ParallaxScrollView headerBackgroundColor={{light: '#A1CEDC', dark: '#1D3D47'}}>
        <ThemedView style={styles.container}>
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorTitle}>Unable to load schedule</ThemedText>
            <ThemedText style={styles.errorMessage}>{error}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  return (
    <ErrorBoundary>
      <ParallaxScrollView headerBackgroundColor={{light: '#A1CEDC', dark: '#1D3D47'}}>
        <ThemedView style={styles.container}>
          <ThemedText style={styles.title}>Weekly Schedule</ThemedText>
          <ThemedText style={styles.instruction}>
            Tap pending items (lighter blue) to confirm or reject them
          </ThemedText>

          {/* Refresh button for manual refresh since ParallaxScrollView doesn't support RefreshControl */}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator color="#007AFF" size="small" />
            ) : (
              <ThemedText style={styles.refreshButtonText}>🔄 Refresh</ThemedText>
            )}
          </TouchableOpacity>

          {/* Show error banner if there's an error but we have cached data */}
          {error && scheduleData && (
            <View style={styles.errorBanner}>
              <ThemedText style={styles.errorBannerText}>{error}</ThemedText>
              <TouchableOpacity onPress={() => {}}>
                <ThemedText style={styles.dismissText}>✕</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          <ThemedText style={styles.dimensionInfo}>
            Screen: {screenDimensions.width.toFixed(0)}x{screenDimensions.height.toFixed(0)}
            {isLandscape ? ' (Landscape)' : ' (Portrait)'}
          </ThemedText>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.gridContainer}>
              {weekdays.map((day, index) =>
                renderColumn(day as keyof WeekSchedule, index)
              )}
            </View>
          </ScrollView>

          {/* Legend for confirmation states */}
          <View style={styles.statusLegend}>
            <ThemedText style={styles.legendTitle}>Status Legend:</ThemedText>
            <View style={styles.statusRow}>
              <View style={[styles.statusIndicator, styles.scheduleItemConfirmed]} />
              <ThemedText style={styles.statusLabel}>Confirmed</ThemedText>
            </View>
            <View style={styles.statusRow}>
              <View style={[styles.statusIndicator, styles.scheduleItemPending]} />
              <ThemedText style={styles.statusLabel}>Pending (tap to confirm)</ThemedText>
            </View>
            <View style={styles.statusRow}>
              <View style={[styles.statusIndicator, styles.scheduleItemRejected]} />
              <ThemedText style={styles.statusLabel}>Rejected</ThemedText>
            </View>
          </View>

          {/* Confirmation Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ThemedText style={styles.modalTitle}>Confirm Schedule Item</ThemedText>
                <ThemedText style={styles.modalText}>
                  {selectedItem?.item.text}
                </ThemedText>
                <ThemedText style={styles.modalSubtext}>
                  {selectedItem?.item.yPosStart}% - {selectedItem?.item.yPosEnd}%
                </ThemedText>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={() => handleConfirmation(true)}
                    disabled={selectedItem ? confirmingLessons.has(selectedItem.item.lessonId) : false}
                  >
                    {selectedItem && confirmingLessons.has(selectedItem.item.lessonId) ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <ThemedText style={styles.buttonText}>Confirm</ThemedText>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.rejectButton]}
                    onPress={() => handleConfirmation(false)}
                    disabled={selectedItem ? confirmingLessons.has(selectedItem.item.lessonId) : false}
                  >
                    {selectedItem && confirmingLessons.has(selectedItem.item.lessonId) ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <ThemedText style={styles.buttonText}>Reject</ThemedText>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {scheduleData && (
            <View style={styles.legendContainer}>
              <ThemedText style={styles.legendTitle}>Schedule Details</ThemedText>
              {Object.entries(scheduleData).map(([day, items]:[string, ScheduleItem[]]) => {
                const confirmed = items.filter(item => item.confirmed === true).length;
                const pending = items.filter(item => item.confirmed === undefined || item.confirmed === null).length;
                const rejected = items.filter(item => item.confirmed === false).length;

                return (
                  <View key={day} style={styles.legendDay}>
                    <ThemedText style={styles.legendDayName}>{day}:</ThemedText>
                    <ThemedText style={styles.legendItems}>
                      {confirmed}✓ {pending}? {rejected}✗
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          )}
        </ThemedView>
      </ParallaxScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.8,
  },
  refreshButton: {
    alignSelf: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  dimensionInfo: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.6,
  },
  gridContainer: {
    flexDirection: 'row',
    height: 450,
  },
  column: {
    marginRight: 2,
  },
  dayHeader: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 4,
  },
  dayText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  scheduleContainer: {
    position: 'relative',
    backgroundColor: '#fafafa',
    borderRadius: 4,
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#e0e0e0',
    opacity: 0.5,
  },
  scheduleItem: {
    position: 'absolute',
    borderRadius: 6,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
  },
  scheduleItemConfirmed: {
    backgroundColor: '#007AFF',
    borderColor: '#0056b3',
  },
  scheduleItemPending: {
    backgroundColor: '#87CEEB',
    borderColor: '#6BB6FF',
  },
  scheduleItemRejected: {
    backgroundColor: '#9E9E9E',
    borderColor: '#757575',
  },
  scheduleItemLoading: {
    opacity: 0.7,
  },
  scheduleText: {
    color: 'white',
    fontSize: 9,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 1,
  },
  scheduleTextRejected: {
    color: '#CCCCCC',
    fontSize: 9,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 1,
  },
  positionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 7,
    textAlign: 'center',
    marginBottom: 1,
  },
  statusText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 6,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  columnBorder: {
    position: 'absolute',
    right: 0,
    top: 30,
    bottom: 0,
    width: 1,
    backgroundColor: '#ddd',
  },
  statusLegend: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
    borderWidth: 1,
  },
  statusLabel: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  modalButton: {
    borderRadius: 8,
    padding: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
  },
  legendContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  legendDay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  legendDayName: {
    fontSize: 14,
    fontWeight: '500',
  },
  legendItems: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorBanner: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBannerText: {
    color: '#d32f2f',
    fontSize: 14,
    flex: 1,
  },
  dismissText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: 'bold',
    paddingLeft: 10,
  },
});