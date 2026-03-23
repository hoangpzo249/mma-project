import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function StoryHeader({ story }: { story: any }) {
  const router = useRouter();

  if (!story) return null;

  return (
    <View style={styles.container}>
      {/* Background Cover With Blur */}
      <View style={styles.backgroundWrapper}>
        <Image source={{ uri: story.thumbnail || story.imageUrl }} style={styles.backgroundImage} blurRadius={15} />
        <LinearGradient
          colors={['rgba(11,22,44,0.4)', 'rgba(11,22,44,0.8)', '#0b162c']}
          style={styles.gradientOverlay}
        />
      </View>
      
      {/* Top Navigation */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="share-social" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Main Info */}
      <View style={styles.mainInfo}>
        <View style={styles.coverShadow}>
          <Image source={{ uri: story.thumbnail || story.imageUrl }} style={styles.coverImage} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={3}>{story.title}</Text>
          <Text style={styles.author}>By {story.author || 'Unknown'}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Ionicons name="star" size={14} color="#fbbf24" />
              <Text style={styles.statText}>4.8</Text>
            </View>
            <View style={styles.statBadge}>
              <Ionicons name="eye" size={14} color="#94a3b8" />
              <Text style={styles.statText}>{story.views?.toLocaleString() || 0}</Text>
            </View>
          </View>
          
          <View style={styles.statusBadge}>
             <Ionicons name="time" size={14} color={story.status === 'Ongoing' ? '#10b981' : '#0ea5e9'} />
             <Text style={[styles.statusText, {color: story.status === 'Ongoing' ? '#10b981' : '#0ea5e9'}]}>
                {story.status === 'Ongoing' ? 'Ongoing' : 'Completed'}
             </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    paddingTop: 50,
    paddingBottom: 30,
    position: 'relative',
    backgroundColor: '#0b162c',
  },
  backgroundWrapper: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    height: 380,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    zIndex: 10,
  },
  navButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  mainInfo: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
    zIndex: 10,
  },
  coverShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  coverImage: {
    width: 120,
    height: 175,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textContainer: {
    flex: 1,
    marginLeft: 20,
    justifyContent: 'flex-end',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    lineHeight: 32,
  },
  author: {
    color: '#cbd5e1',
    fontSize: 15,
    marginBottom: 12,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  statText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11,22,44,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 6
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  }
});