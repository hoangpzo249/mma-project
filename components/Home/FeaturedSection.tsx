import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const FeaturedSection = ({ randomStories = [] }: { randomStories?: any[] }) => {
  const [activeStory, setActiveStory] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (randomStories.length > 0) {
      setActiveStory(randomStories[0]);
    }
  }, [randomStories]);

  const topStory = activeStory || {};

  const horizontalList = Array.isArray(randomStories) ? randomStories : [];

  return (
    <View style={styles.container}>
      <ImageBackground
        source={topStory.thumbnail ? { uri: topStory.thumbnail } : undefined}
        style={styles.heroBackground}
        imageStyle={{ opacity: 0.4 }}
        blurRadius={3}
      >
        <LinearGradient
          colors={['transparent', '#0b162c']}
          style={styles.gradientOverlay}
        />
      </ImageBackground>

      <View style={styles.contentContainer}>
        <View style={styles.genreTags}>
          <Text style={styles.tag}>ACTION</Text>
          <Text style={styles.tag}>ADVENTURE</Text>
          <Text style={styles.tag}>MYSTERY</Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#eab308" />
            <Text style={styles.ratingText}> {topStory.rating || '4.6'}</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={1}>{topStory.title}</Text>

        <Text style={styles.description} numberOfLines={2}>
          {topStory.description && topStory.description !== "Đang cập nhật..." ? topStory.description : 'Read the latest chapters of this thrilling masterpiece on MangaCloud. Tap to start your journey now...'}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.btnRead}
            onPress={() => {
              if (topStory?._id) {
                router.push(`/story/${topStory._id}` as any);
              }
            }}
          >
            <Ionicons name="play" size={18} color="black" />
            <Text style={styles.btnReadText}> START READING</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSave}>
            <Ionicons name="bookmark-outline" size={18} color="#94a3b8" />
            <Text style={styles.btnSaveText}> SAVE</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
          {horizontalList.slice(0, 10).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.card, activeStory?._id === item._id && styles.activeCard]}
              onPress={() => setActiveStory(item)}
            >
              {item.thumbnail ? (
                <Image source={{ uri: item.thumbnail }} style={[styles.thumbnail, activeStory?._id === item._id && styles.activeThumbnail]} />
              ) : (
                <View style={[styles.imagePlaceholder, activeStory?._id === item._id && styles.activeThumbnail]} />
              )}
              <Text style={[styles.cardTitle, activeStory?._id === item._id && styles.activeCardTitle]} numberOfLines={1}>{
                item.title.length > 12 ? item.title.substring(0, 12) + '...' : item.title
              }</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    width: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%', // Fade out towards the bottom content blending point
  },
  contentContainer: {
    padding: 20,
    paddingTop: 50,
    justifyContent: 'flex-end',
  },
  genreTags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  tag: {
    color: '#ccc',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 'bold',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 'auto'
  },
  ratingText: {
    color: '#eab308',
    fontWeight: 'bold',
    fontSize: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: 'white',
    marginBottom: 15,
  },
  description: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  btnRead: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnReadText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnSave: {
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSaveText: {
    color: '#94a3b8',
    fontWeight: 'bold',
    fontSize: 14,
  },
  horizontalList: {
    flexDirection: 'row',
  },
  card: {
    marginRight: 15,
    alignItems: 'center',
    width: 80,
    opacity: 0.6, // Default unselected state
  },
  activeCard: {
    opacity: 1, // Full opacity when selected
  },
  thumbnail: {
    width: 80,
    height: 120,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: '#0ea5e9', // Highlight border for selected
  },
  imagePlaceholder: {
    width: 80,
    height: 120,
    backgroundColor: '#475569',
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeCardTitle: {
    color: '#0ea5e9', // Highlight text for selected
  }
});

export default FeaturedSection;
