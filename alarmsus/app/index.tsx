import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import CustomMap from '../components/CustomMap';
import FilterPanel from '../components/FilterPanel';

export default function Home() {
  const [showAEDs, setShowAEDs] = useState(false);

  return (
    <View style={styles.container}>
      <CustomMap showAEDs={showAEDs} />
      <FilterPanel showAEDs={showAEDs} setShowAEDs={setShowAEDs} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
