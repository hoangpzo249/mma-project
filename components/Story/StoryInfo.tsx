import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function StoryInfo({ story }: { story: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      {/* Synopsis Section */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Synopsis</Text>
        <Ionicons name="information-circle-outline" size={20} color="#94a3b8" />
      </View>

      <View style={styles.descContainer}>
        <Text 
           style={styles.description} 
           numberOfLines={expanded ? undefined : 4}
        >
          {story.description || "No description provided for this story."}
        </Text>
        {!expanded && (
           <LinearGradient
             colors={['transparent', 'rgba(11,22,44,0.8)', '#0b162c']}
             style={styles.fadeGradient}
           />
        )}
      </View>

      <TouchableOpacity 
         style={styles.expandBtn} 
         onPress={() => setExpanded(!expanded)}
         activeOpacity={0.7}
      >
        <Text style={styles.expandText}>
          {expanded ? 'Show Less' : 'Read More'}
        </Text>
        <Ionicons 
           name={expanded ? 'chevron-up' : 'chevron-down'} 
           size={16} 
           color="#0ea5e9" 
           style={{ marginLeft: 4 }} 
        />
      </TouchableOpacity>

      {/* Genres / Tags Section */}
      <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>Genres</Text>
      <View style={styles.tagsContainer}>
        {['Action', 'Fantasy', 'Adventure', 'Magic'].map((tag, index) => (
           <View key={index} style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag}</Text>
           </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0b162c',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  descContainer: {
    position: 'relative',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#cbd5e1',
    fontWeight: '400',
  },
  fadeGradient: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 40,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  expandText: {
    color: '#0ea5e9',
    fontSize: 14,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tagText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  }
});