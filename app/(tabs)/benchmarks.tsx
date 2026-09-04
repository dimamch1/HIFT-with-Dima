import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../src/constants/theme';
import { ICONIC_BENCHMARKS } from '../../src/constants/benchmarks';
import { BenchmarkCategory, BenchmarkPRRecord, BenchmarkWOD, TimerMode } from '../../src/types';
import { StorageService } from '../../src/services/storageService';
import { useTimerStore } from '../../src/store/useTimerStore';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import {
  Trophy,
  Target,
  Zap,
  Clock,
  Play,
  Plus,
  X,
  Flame,
  Award,
  Search,
} from 'lucide-react-native';
import { HapticsService } from '../../src/services/hapticsService';

const CATEGORIES: { key: string; label: string }[] = [
  { key: 'ALL', label: 'ALL' },
  { key: 'NO_SCALING', label: 'NO SCALING' },
  { key: 'METCONS', label: 'METCONS' },
  { key: 'STRENGTH_COMPLEX', label: 'STRENGTH' },
  { key: 'CONDITIONING', label: 'CONDITIONING' },
  { key: 'THE_GIRLS', label: 'THE GIRLS' },
  { key: 'HEROES', label: 'HEROES' },
  { key: 'TEAM_WODS', label: 'TEAM WODS' },
];

export default function BenchmarksScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkWOD | null>(null);
  const [prRecords, setPrRecords] = useState<BenchmarkPRRecord[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [newPrScore, setNewPrScore] = useState('');
  const [newPrNotes, setNewPrNotes] = useState('');

  const setTimerMode = useTimerStore((s) => s.setMode);
  const updateTimerConfig = useTimerStore((s) => s.updateConfig);

  useEffect(() => {
    loadPRs();
  }, []);

  const loadPRs = async () => {
    const records = await StorageService.getBenchmarkPRs();
    setPrRecords(records);
  };

  const filteredBenchmarks = ICONIC_BENCHMARKS.filter((b) => {
    const matchesCategory = selectedCategory === 'ALL' || b.category === selectedCategory;
    if (!matchesCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.movements.some((m) => m.name.toLowerCase().includes(q))
    );
  });

  const getPersonalPR = (benchmarkId: string): BenchmarkPRRecord | undefined => {
    return prRecords.find((r) => r.benchmarkId === benchmarkId);
  };

  const getCategoryBadgeVariant = (category: BenchmarkCategory): 'orange' | 'purple' | 'neon' | 'cyan' | 'muted' => {
    switch (category) {
      case 'NO_SCALING':
        return 'neon';
      case 'HEROES':
      case 'TEAM_WODS':
        return 'purple';
      case 'THE_GIRLS':
      case 'STRENGTH_COMPLEX':
        return 'orange';
      case 'METCONS':
      case 'CONDITIONING':
        return 'cyan';
      default:
        return 'muted';
    }
  };

  const handleLaunchBenchmarkInTimer = (wod: BenchmarkWOD) => {
    HapticsService.workoutGo();
    const mode: TimerMode =
      wod.format === 'CHIPPER'
        ? 'FOR_TIME'
        : wod.format === 'E2MOM'
        ? 'EMOM'
        : wod.format === 'INTERVAL'
        ? 'CUSTOM_INTERVAL'
        : wod.format;

    setTimerMode(mode);
    updateTimerConfig({
      timeCapSeconds: wod.timeCapMinutes * 60,
    });

    useTimerStore.getState().setActiveWodDetails({
      title: wod.name,
      format: wod.format,
      description: wod.description,
      movements: wod.movements.map((m) => {
        let text = '';
        if (m.reps) text = `${m.reps} Reps`;
        else if (m.distance) text = `${m.distance}`;
        else if (m.calories) text = `${m.calories} Cals`;

        const rx = m.rxWeightMen ? ` • Rx: ${m.rxWeightMen} / ${m.rxWeightWomen || ''}` : '';
        return {
          name: m.name,
          prescription: `${text}${rx}`,
        };
      }),
      intendedStimulus: wod.intendedStimulus,
      targetScore: wod.targetGoodScore,
    });

    router.push('/(tabs)/timer');
  };

  const handleSavePR = async () => {
    if (!selectedBenchmark || !newPrScore.trim()) return;

    const pr: BenchmarkPRRecord = {
      id: `pr_${Date.now()}`,
      benchmarkId: selectedBenchmark.id,
      date: new Date().toISOString().split('T')[0],
      score: newPrScore.trim(),
      isRx: true,
      notes: newPrNotes.trim(),
      isAllTimePR: true,
    };

    await StorageService.saveBenchmarkPR(pr);
    await loadPRs();

    HapticsService.workoutComplete();
    setShowLogModal(false);
    setNewPrScore('');
    setNewPrNotes('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarSide} />
        <View style={styles.brandTitleCol}>
          <Text style={styles.brandTitle}>HIFT with Dima</Text>
          <Text style={styles.subtitle}>WOD Vault • No Scaling & Benchmarks ({ICONIC_BENCHMARKS.length} WODs)</Text>
        </View>
        <View style={[styles.topBarSide, { alignItems: 'flex-end' }]}>
          <Trophy size={24} color={COLORS.neonLime} />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={16} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by WOD name, movement (e.g. Snatch, MU, Sled)..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.searchInput}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills (Horizontal Scroll) */}
      <View style={styles.categoryFilterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilter}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => {
                  HapticsService.countdownTick();
                  setSelectedCategory(cat.key);
                }}
                style={[
                  styles.categoryTab,
                  isSelected && styles.categoryTabActive,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {filteredBenchmarks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No workouts found</Text>
            <Text style={styles.emptyStateSubtitle}>Try searching with different terms or select another category</Text>
          </View>
        ) : (
          filteredBenchmarks.map((wod) => {
            const pr = getPersonalPR(wod.id);

            return (
              <View key={wod.id} style={styles.benchmarkCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.nameGroup}>
                    <Text style={styles.wodName}>{wod.name}</Text>
                    <Badge
                      label={wod.category.replace(/_/g, ' ')}
                      variant={getCategoryBadgeVariant(wod.category)}
                      size="sm"
                    />
                  </View>

                  {pr ? (
                    <View style={styles.prBadge}>
                      <Award size={12} color="#000000" />
                      <Text style={styles.prBadgeText}>PR: {pr.score}</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        HapticsService.countdownTick();
                        setSelectedBenchmark(wod);
                        setShowLogModal(true);
                      }}
                      style={styles.logPrBtn}
                    >
                      <Plus size={12} color={COLORS.cyanElectric} />
                      <Text style={styles.logPrBtnText}>Log PR</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.description}>{wod.description}</Text>

                {/* Target Score Standards */}
                <View style={styles.standardsRow}>
                  <View style={styles.standardBox}>
                    <Text style={styles.standardLabel}>Target Good</Text>
                    <Text style={styles.standardVal}>{wod.targetGoodScore}</Text>
                  </View>
                  <View style={styles.standardBox}>
                    <Text style={styles.standardLabel}>Elite Games</Text>
                    <Text style={styles.standardValElite}>{wod.targetEliteScore}</Text>
                  </View>
                  <View style={styles.standardBox}>
                    <Text style={styles.standardLabel}>Time Cap</Text>
                    <Text style={styles.standardVal}>{wod.timeCapMinutes}:00</Text>
                  </View>
                </View>

                {/* Stimulus & Pacing */}
                <View style={styles.stimulusBox}>
                  <Zap size={14} color={COLORS.safetyOrange} />
                  <Text style={styles.stimulusText}>{wod.intendedStimulus}</Text>
                </View>

                {/* Movements breakdown */}
                <View style={styles.movementsList}>
                  {wod.movements.map((m, idx) => (
                    <View key={idx} style={styles.movementItem}>
                      <Text style={styles.movementBullet}>•</Text>
                      <Text style={styles.movementText}>
                        <Text style={styles.movementName}>{m.name}</Text>
                        {m.reps ? ` (${m.reps} reps)` : ''}
                        {m.distance ? ` (${m.distance})` : ''}
                        {m.calories ? ` (${m.calories} cals)` : ''}
                        {m.rxWeightMen ? ` — Rx: ${m.rxWeightMen} / ${m.rxWeightWomen || ''}` : ''}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.cardActions}>
                  <Button
                    title="Launch in Timer"
                    variant="primary"
                    size="md"
                    icon={<Play size={14} color="#000" fill="#000" />}
                    onPress={() => handleLaunchBenchmarkInTimer(wod)}
                    style={styles.actionBtn}
                  />
                  <Button
                    title={pr ? 'Update PR' : 'Record PR'}
                    variant="secondary"
                    size="md"
                    onPress={() => {
                      HapticsService.countdownTick();
                      setSelectedBenchmark(wod);
                      setShowLogModal(true);
                    }}
                    style={styles.actionBtn}
                  />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* 📝 Log Benchmark PR Modal */}
      <Modal visible={showLogModal} transparent animationType="slide" onRequestClose={() => setShowLogModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
          >
            <View style={styles.prModal}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Record Benchmark PR</Text>
                  <Text style={styles.modalSubtitle} numberOfLines={1}>{selectedBenchmark?.name}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    HapticsService.countdownTick();
                    setShowLogModal(false);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>
                Score ({selectedBenchmark?.format === 'FOR_TIME' || selectedBenchmark?.format === 'CHIPPER' ? 'e.g. 03:45' : 'e.g. 24 Rounds + 5 Reps'}):
              </Text>
              <TextInput
                value={newPrScore}
                onChangeText={setNewPrScore}
                placeholder={selectedBenchmark?.format === 'FOR_TIME' || selectedBenchmark?.format === 'CHIPPER' ? '03:45' : '22 Rds'}
                placeholderTextColor={COLORS.textMuted}
                style={styles.prInput}
                inputMode="text"
                returnKeyType="next"
                selectTextOnFocus
              />

              <Text style={styles.inputLabel}>Tactical Notes & Conditions:</Text>
              <TextInput
                value={newPrNotes}
                onChangeText={setNewPrNotes}
                placeholder="e.g. Unbroken thrusters, butterfly pull-ups..."
                placeholderTextColor={COLORS.textMuted}
                style={[styles.prInput, styles.notesInputArea]}
                inputMode="text"
                multiline
                returnKeyType="done"
                blurOnSubmit={true}
              />

              <Button
                title="Save Benchmark Record"
                variant="primary"
                size="lg"
                onPress={handleSavePR}
                style={styles.savePrBtn}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
  },
  topBarSide: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  brandTitleCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    height: 42,
  },
  searchIcon: {
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 0,
  },
  categoryFilterWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
    paddingVertical: SPACING.sm,
  },
  categoryFilter: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs,
  },
  categoryTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  categoryTabActive: {
    backgroundColor: 'rgba(204, 255, 0, 0.15)',
    borderColor: COLORS.neonLime,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  categoryTextActive: {
    color: COLORS.neonLime,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl * 2,
    gap: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyStateTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  emptyStateSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  benchmarkCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  nameGroup: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.xs,
    marginRight: SPACING.xs,
  },
  wodName: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '900',
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neonLime,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  prBadgeText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
  },
  logPrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    gap: 4,
  },
  logPrBtnText: {
    color: COLORS.cyanElectric,
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginVertical: SPACING.xs,
  },
  standardsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  standardBox: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  standardLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  standardVal: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  standardValElite: {
    color: COLORS.neonLime,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 2,
  },
  stimulusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginVertical: SPACING.xs,
    gap: 6,
  },
  stimulusText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  movementsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
    gap: 4,
  },
  movementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  movementBullet: {
    color: COLORS.neonLime,
    fontSize: 12,
    fontWeight: '900',
  },
  movementText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  movementName: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  actionBtn: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  keyboardAvoidContainer: {
    width: '100%',
  },
  prModal: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  modalSubtitle: {
    color: COLORS.neonLime,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  prInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  } as any,
  notesInputArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  savePrBtn: {
    marginTop: SPACING.lg,
  },
});
