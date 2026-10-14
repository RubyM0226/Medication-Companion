import React, { useState } from 'react'; //usestate lets screen remember a val and update it when it changes. 
import { //this imports 5 things from the react-native package. 
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

import { Colors } from '@/constants/colors'; //imports color obj defined in another file in proj 

export default function HomeScreen() {//defines func homescreen, and export default allows another file to import this component as the file's main export
  const userName = 'Yasmin';  // TEMP data for the Home screen, later pull from sign in 

  const [doseStatus, setDoseStatus] = useState('Upcoming'); //assigns val "Upcoming" to doseStatus (holds current val) and setDoseStatus (func used to change that val)
  //updating the val in donseStatus automatically triggers setDoseStatus to be updated
  const [reminderMessage, setReminderMessage] = useState(''); //creates variable (empty string)reminderMessage and function setReminderMessage changes it

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Greeting */}
      {/* Separated out from boxes into a clean, flat header section matching the target design layout */}
      <View style={styles.headerSection}> {/* creates container that all below falls into */}
        <Text style={styles.heading}>Hello, {userName}!</Text>
        <Text style={styles.subheading}>
          Here is your medication plan for today.
        </Text>
      </View>

      {/* Next medication */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>NEXT • 8:00 AM</Text>
          </View>
          <View style={styles.timeBadge}>
            <Text style={styles.timeBadgeText}>IN 42 MIN</Text>
          </View>
        </View>

        {/* hardcoded for now */}
        <Text style={styles.medicationName}>Medication A</Text>
        <Text style={styles.medDetailText}>500 mg • With breakfast</Text>

        <Text style={styles.status}>{doseStatus}</Text>

        {/* view component that groups buttons together */}
        <View style={styles.buttonRow}> 
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={() => { //specifies what happens when button pressed
              setDoseStatus('Marked as taken'); //when user presses button change status to marked as taken
              setReminderMessage(''); //reminder message is cleared 
            }}
          >
            <Text style={styles.primaryButtonText}>Taken</Text>
            {/* closes first button */}
          </Pressable> 
          {/* opens second button */}
          <Pressable 
            style={styles.button}
            onPress={() => {
              // when remind me later button is pushed, it says sentence below. Message goes away once you click the taken button
              setReminderMessage( 
                'Reminder requested. Notifications are not set up yet.'
              );
            }}
          >
            <Text style={styles.secondaryButtonText}>Later</Text>
          </Pressable>
        </View>

        {/* conditional display, only show reminder message if it is not empty string */}
        {reminderMessage !== '' && ( 
          <Text style={styles.reminderText}>{reminderMessage}</Text>
        )}
      </View>

      {/* Next dose after the first one */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>LATER TODAY</Text>
        <View style={styles.medRow}>
          <View style={styles.timeLabelBox}>
            <Text style={styles.timeLabelText}>2:00 PM</Text>
          </View>
          <View style={styles.medRowContent}>
            <Text style={styles.medicationNameInline}>Medication B</Text>
            <Text style={styles.medDetailTextInline}>1 tablet</Text>
          </View>
        </View>
      </View>

      {/* Seven-day summary */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>7-DAY SNAPSHOT</Text>
        <View style={styles.snapshotRow}>
          <View style={styles.snapshotLeft}>
            <Text style={styles.snapshotCount}>12 of 14</Text>
            <Text style={styles.snapshotSubtext}>doses logged</Text>
          </View>
          <View style={styles.snapshotRight}>
            <Text style={styles.percentageText}>86%</Text>
          </View>
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
    marginBottom: 4,
  },
  badge: {
    borderWidth: 1,
    borderColor: Colors.textPrimary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  timeBadge: {
    backgroundColor: Colors.danger, 
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  timeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onDanger, 
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 1,
    opacity: 0.6,
    marginBottom: 4,
  },
  medicationName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  medDetailText: {
    fontSize: 15,
    color: Colors.textPrimary,
    opacity: 0.9,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary, 
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary, 
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.onPrimary, 
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary, 
  },
  reminderText: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
  },
  timeLabelBox: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  timeLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  medRowContent: {
    flex: 1,
  },
  medicationNameInline: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  medDetailTextInline: {
    fontSize: 14,
    color: Colors.textPrimary,
    opacity: 0.6,
  },
  snapshotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  snapshotLeft: {
    gap: 2,
  },
  snapshotCount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  snapshotSubtext: {
    fontSize: 13,
    color: Colors.textPrimary,
    opacity: 0.6,
  },
  snapshotRight: {
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
});