import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const PopularRank = ({ hotStories = [] }: { hotStories?: any[] }) => {
  const [activeTab, setActiveTab] = useState('WEEK');
  const router = useRouter();
  const tabs = ['WEEK', 'MONTH', 'ALL'];
  
  const mangas = hotStories.length > 0 ? hotStories.slice(0, 5).map((s, idx) => ({
    _id: s._id,
    title: s.title,
    rating: (Math.random() * 2 + 3).toFixed(1), // mock rating
    genres: 'ACTION, ADVENTURE, MYS...', // mock genre
    rank: idx + 1,
    thumbnail: s.thumbnail
  })) : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>POPULAR</Text>
        <View style={styles.tabsMenu}>
          {tabs.map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {mangas.map((manga, idx) => (
        <TouchableOpacity 
          key={idx} 
          style={styles.listItem}
          onPress={() => {
            if (manga._id) {
              router.push(`/story/${manga._id}` as any);
            }
          }}
        >
          <Text style={styles.rank}>{manga.rank}</Text>
          {manga.thumbnail ? (
            <Image source={{ uri: manga.thumbnail }} style={styles.thumbnail} />
          ) : (
             <View style={styles.imagePlaceholder} />
          )}
          <View style={styles.info}>
            <Text style={styles.itemTitle} numberOfLines={1}>{manga.title}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#eab308" />
              <Text style={styles.rating}> {manga.rating}</Text>
            </View>
            <Text style={styles.genres}>{manga.genres}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.btnFullRank}>
        <Text style={styles.btnFullRankText}>VIEW FULL RANKING</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#0a0f1d',
    borderRadius: 20,
    marginHorizontal: 10,
    marginTop: 20,
    marginBottom: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
  },
  tabsMenu: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 20,
    overflow: 'hidden',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  activeTab: {
    backgroundColor: '#0ea5e9',
    borderRadius: 20,
  },
  tabText: {
    color: '#94a3b8',
    fontWeight: 'bold',
    fontSize: 12,
  },
  activeTabText: {
    color: 'white',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rank: {
    fontSize: 28,
    fontWeight: '900',
    color: '#334155',
    width: 40,
    textAlign: 'center',
  },
  thumbnail: {
    width: 60,
    height: 80,
    borderRadius: 10,
    marginHorizontal: 15,
  },
  imagePlaceholder: {
    width: 60,
    height: 80,
    backgroundColor: '#475569',
    borderRadius: 10,
    marginHorizontal: 15,
  },
  info: {
    flex: 1,
  },
  itemTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  rating: {
    color: '#94a3b8',
    fontSize: 12,
  },
  genres: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  btnFullRank: {
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  btnFullRankText: {
    color: '#cbd5e1',
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});

export default PopularRank;
