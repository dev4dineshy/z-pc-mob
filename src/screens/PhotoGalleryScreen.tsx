import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Modal, Image, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { colors, spacing, radius } from '../theme';
import AppHeader from '../components/AppHeader';
import RefreshableScrollView from '../components/RefreshableScrollView';
import { useRefresh } from '../hooks/useRefresh';
import { useApp } from '../AppContext';

const W   = Dimensions.get('window').width;
// 2 columns: subtract side padding (md each side) + gap between the 2 columns
const GAP = spacing.sm;
const COL = (W - spacing.md * 2 - GAP) / 2;
const TABS = ['All', 'Events', 'Community'];

const GALLERY_IMGS = [
  require('../../assets/images/gallery/community-meeting-gallery.png'),
  require('../../assets/images/gallery/health-camp.png'),
  require('../../assets/images/gallery/library.png'),
  require('../../assets/images/gallery/road.png'),
  require('../../assets/images/gallery/sports-day.png'),
  require('../../assets/images/gallery/tree-planting.png'),
];

export default function PhotoGalleryScreen({ navigation }: any) {
  const { data } = useApp();
  const { refreshing, onRefresh, errorMsg, clearError } = useRefresh();
  const [tab, setTab] = useState('All');
  const [selected, setSelected] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const gallery: any[] = data.gallery || [];
  const filtered = tab === 'All' ? gallery : gallery.filter((g: any) => g.category === tab);

  async function handleDownload(imgSource: any) {
    if (Platform.OS === 'web') {
      Alert.alert('Not supported', 'Photo saving is not available on web.');
      return;
    }
    try {
      setDownloading(true);
      // Resolve the bundled asset to a local URI via expo-asset
      const asset = require('expo-asset').Asset.fromModule(imgSource);
      await asset.downloadAsync();
      const localUri: string = asset.localUri ?? asset.uri;

      // Copy to a shareable cache path
      const fileName = localUri.split('/').pop() ?? 'photo.png';
      const destUri = FileSystem.cacheDirectory + fileName;
      await FileSystem.copyAsync({ from: localUri, to: destUri });

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Not supported', 'Sharing is not available on this device.');
        return;
      }
      await Sharing.shareAsync(destUri, { mimeType: 'image/png', dialogTitle: 'Save photo' });
    } catch {
      Alert.alert('Error', 'Could not save photo. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Lightbox */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={s.lightboxOverlay}>
          {/* Close */}
          <TouchableOpacity style={s.lightboxClose} onPress={() => setSelected(null)} accessibilityLabel="Close photo">
            <MaterialIcons name="close" size={26} color={colors.white} />
          </TouchableOpacity>

          {selected && (() => {
            const idx = filtered.indexOf(selected);
            const imgSrc = GALLERY_IMGS[idx % GALLERY_IMGS.length];
            return (
              <>
                <Image source={imgSrc} style={s.lightboxImg} resizeMode="contain" />
                <Text style={s.lightboxTitle}>{selected.title}</Text>
                {selected.caption && <Text style={s.lightboxCaption}>{selected.caption}</Text>}

                {/* Download button */}
                <TouchableOpacity
                  style={[s.downloadBtn, downloading && s.downloadBtnDisabled]}
                  onPress={() => handleDownload(imgSrc)}
                  disabled={downloading}
                  accessibilityLabel="Save photo to gallery"
                >
                  <MaterialIcons name="file-download" size={20} color={colors.white} />
                  <Text style={s.downloadBtnTxt}>{downloading ? 'Saving…' : 'Save to Gallery'}</Text>
                </TouchableOpacity>
              </>
            );
          })()}
        </View>
      </Modal>

      <AppHeader variant="title" navigation={navigation} title="Photo Gallery" />
      <RefreshableScrollView
        refreshing={refreshing}
        onRefresh={onRefresh}
        errorMsg={errorMsg}
        clearError={clearError}
      >
        <View style={s.body}>
          <View style={s.tabRow}>
            {TABS.map(t => (
              <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
                <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── 2-column grid ── */}
          <View style={s.grid}>
            {filtered.map((item: any, i: number) => (
              <TouchableOpacity
                key={item.id}
                style={[s.cell, i % 2 === 0 ? { marginRight: GAP } : {}]}
                onPress={() => setSelected(item)}
                activeOpacity={0.85}
              >
                <Image
                  source={GALLERY_IMGS[i % GALLERY_IMGS.length]}
                  style={s.cellImg}
                  resizeMode="cover"
                />
                <Text style={s.cellLabel} numberOfLines={1}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {filtered.length === 0 && (
            <View style={s.emptyWrap}>
              <MaterialIcons name="photo-library" size={40} color={colors.border} />
              <Text style={s.empty}>No photos found.</Text>
            </View>
          )}
        </View>
      </RefreshableScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  /* Lightbox */
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  lightboxClose: { position: 'absolute', top: 52, right: spacing.lg, zIndex: 10, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  lightboxImg: {
    width: W - spacing.lg * 2,
    height: W - spacing.lg * 2,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  lightboxTitle: { fontSize: 17, fontWeight: '700', color: colors.white, textAlign: 'center', marginBottom: 4 },
  lightboxCaption: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: spacing.md },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.md,
    backgroundColor: colors.teal,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: radius.full,
  },
  downloadBtnDisabled: { opacity: 0.6 },
  downloadBtnTxt: { color: colors.white, fontWeight: '700', fontSize: 15 },

  /* Body */
  body: { padding: spacing.md },
  tabRow: { flexDirection: 'row', marginBottom: spacing.md },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  tabActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  tabTxt: { fontSize: 13, color: colors.navy, fontWeight: '600' },
  tabTxtActive: { color: colors.white },

  /* 2-column grid — left col gets marginRight: GAP applied inline */
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: COL, marginBottom: spacing.sm },
  cellImg: {
    width: COL,
    height: COL * 0.75,    /* 4:3 aspect — taller than square, fills nicely */
    borderRadius: radius.md,
    marginBottom: 5,
  },
  cellLabel: { fontSize: 12, fontWeight: '600', color: colors.navy, textAlign: 'center', paddingHorizontal: 2 },

  /* Empty state */
  emptyWrap: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  empty: { fontSize: 14, color: colors.textMuted },
});
