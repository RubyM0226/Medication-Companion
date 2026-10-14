import React from 'react'; 
import { 
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors } from '@/constants/colors'; 
export default function HistoryScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Page Title - Clean and flat typography matching the home tab */}
      <View style={styles.headerSection}>
        <Text style={styles.heading}>Medication history</Text>
        <Text style={styles.subheading}>
          Review your past treatment courses and completed plans.
        </Text>
      </View>

      {/* Chronological Section Splitter */}
      <Text style={styles.timelineSectionTitle}>RECENTLY COMPLETED</Text>

      {/* Past Medication Card 1 */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.medicationName}>Medication A</Text>
          {/* Visual Anchor: An status badge indicating how the timeline ended */}
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>COMPLETED</Text>
          </View>
        </View>
        
        <Text style={styles.medDetailText}>500 mg</Text>

        {/* Date Row Layout - Split horizontally to keep text scannable */}
        <View style={styles.dateRow}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>STARTED</Text>
            <Text style={styles.dateValue}>Jan 12, 2026</Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>STOPPED</Text>
            <Text style={styles.dateValue}>Feb 12, 2026</Text>
          </View>
        </View>

        {/* Adherence breakdown tracking bar */}
        <View style={styles.adherenceRow}>
          <Text style={styles.adherenceLabel}>Adherence Rate:</Text>
          <Text style={styles.adherenceValue}>94% (58/60 doses)</Text>
        </View>
      </View>

      {/* Another Chronological Section Splitter */}
      <Text style={styles.timelineSectionTitle}>OLDER HISTORIC COURSES</Text>

      {/* Past Medication Card 2 */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.medicationName}>Medication C</Text>
          <View style={styles.pausedBadge}>
            <Text style={styles.pausedBadgeText}>DISCONTINUED</Text>
          </View>
        </View>
        
        <Text style={styles.medDetailText}>100 mg</Text>

        <View style={styles.dateRow}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>STARTED</Text>
            <Text style={styles.dateValue}>Oct 01, 2025</Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>STOPPED</Text>
            <Text style={styles.dateValue}>Nov 15, 2025</Text>
          </View>
        </View>

        <View style={styles.adherenceRow}>
          <Text style={styles.adherenceLabel}>Adherence Rate:</Text>
          <Text style={styles.adherenceValue}>82% (82/100 doses)</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background, 
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    gap: 16,
  },
  headerSection: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 16,
    color: Colors.textPrimary,
    opacity: 0.8,
    marginTop: 4,
  },
  timelineSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 1,
    opacity: 0.6,
    marginTop: 10,
    marginBottom: 2,
  },
  card: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.textPrimary,
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medicationName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  medDetailText: {
    fontSize: 14,
    color: Colors.textPrimary,
    opacity: 0.7,
    marginTop: -8, // Pulls the dosage text slightly closer underneath the medicine name
  },
  statusBadge: {
    backgroundColor: Colors.primary, // Uses theme teal fill
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onPrimary, // High-contrast text on top of the teal background
  },
  pausedBadge: {
    borderWidth: 1,
    borderColor: Colors.danger, // Outline utilizing your semantic danger red/orange color role
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  pausedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.danger,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 32,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.textPrimary,
    paddingVertical: 12,
    marginTop: 4,
    opacity: 0.9,
  },
  dateBlock: {
    gap: 2,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textPrimary,
    opacity: 0.5,
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  adherenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  adherenceLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
    opacity: 0.7,
  },
  adherenceValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});