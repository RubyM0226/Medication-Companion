
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
      <View style={styles.section}> //creates container that all below falls into 
        <Text style={styles.heading}>Hello, {userName}!</Text>
        <Text style={styles.text}>
          Here is your medication plan for today.
        </Text>
      </View>

      {/* Next medication */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Up next</Text>
        //hardcoded for now 
        <Text style={styles.medicationName}>Medication A</Text>
        <Text style={styles.text}>500 mg</Text>
        <Text style={styles.text}>Take with breakfast</Text>
        <Text style={styles.text}>Due at 8:00 AM</Text>

        <Text style={styles.status}>{doseStatus}</Text>

        <View style={styles.buttonRow}> //view component that groups buttons together
          <Pressable
            style={styles.button}
            onPress={() => { //specifies what happens when button pressed
              setDoseStatus('Marked as taken'); //when user presses button change status to marked as taken
              setReminderMessage(''); //reminder message is cleared 
            }}
          >
            <Text style={styles.buttonText}>Taken</Text>
          </Pressable> //closes first button 

          <Pressable //opens second button 
            style={styles.button}
            onPress={() => {
              // when remind me later button is pushed, it says sentence below. Message goes away once you click the taken button
              setReminderMessage( 
                'Reminder requested. Notifications are not set up yet.'
              );
            }}
          >
            <Text style={styles.buttonText}>Remind me later</Text>
          </Pressable>
        </View>

        {reminderMessage !== '' && ( //conditional display, only show reminder message if it is not empty string
          <Text style={styles.text}>{reminderMessage}</Text>
        )}
      </View>

      {/* Next dose after the first one */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coming up next</Text>
        <Text style={styles.medicationName}>Medication B</Text>
        <Text style={styles.text}>1 tablet · 2:00 PM</Text>
      </View>

      {/* Seven-day summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your last 7 days</Text>
        <Text style={styles.text}>
          Your medication adherence summary will appear here.
        </Text>
      </View>

      {/* Medication list */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My medications</Text>
        <Text style={styles.text}>
          View your current medications and their instructions.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
    gap: 20,
  },
  section: {
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.darkBrown,
    borderRadius: 8,
    gap: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  text: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  button: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  buttonText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
});
