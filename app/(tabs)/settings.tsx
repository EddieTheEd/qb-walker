import { View, Text, Switch, Pressable, StyleSheet } from 'react-native';
import { useSettings } from '@/hooks/SettingsContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function SettingsScreen() {
  const { settings, updateSettings, loading } = useSettings();
  
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }
  
  const availContents = [
    { label: "100% Science", value: "science" },
    { label: "50/50", value: "mixed" },
    { label: "100% History", value: "history" },
  ];

  return (
    <ThemedView style={styles.container}>

      <ThemedView style={styles.settingItem}>
        <ThemedText type="subtitle" style={styles.label}>
          Show question and answer
        </ThemedText>
        <ThemedText style={styles.description}>
          Display the question and answer after each question
        </ThemedText>
        <Switch
          value={settings.showQA}
          onValueChange={(val) => updateSettings({ showQA: val })}
          style={styles.switch}
        />
      </ThemedView>

      <ThemedView style={styles.settingItem}>
        <ThemedText type="subtitle" style={styles.label}>Content Type</ThemedText>
        <ThemedText style={styles.description}>
          Choose the content that will be selected 
        </ThemedText>

        <ThemedView style={{ flexDirection: 'row', marginTop: 8, flexWrap: 'wrap'}}>
          {availContents.map(({ label, value }) => (
            <Pressable
              key={value}
              onPress={() => updateSettings({ content: value })}
              style={[
                styles.contentButton,
                settings.content === value && styles.contentButtonSelected,
              ]}
            >
              <ThemedText
                style={[
                  styles.contentButtonText,
                  settings.content === value && styles.contentButtonTextSelected,
                ]}
              >
                {label}
              </ThemedText>
            </Pressable>
          ))}
        </ThemedView>
      </ThemedView>

    </ThemedView>
  );

}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'flex-start', 
    padding: 20,
    paddingTop: 60
  },
  settingItem: {
    padding: 20,
    borderRadius: 8,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.8,
  },

  switch: {
    alignSelf: 'flex-start',
  },

  contentButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
    marginBottom: 10,
  },

  contentButtonSelected: {
    backgroundColor: '#1a2559',
  },

  contentButtonText: {
    fontSize: 14,
    color: '#151718',
    fontWeight: '500',
  },

  contentButtonTextSelected: {
    color: '#e0e0e0',
    fontWeight: '700',
  },

});
