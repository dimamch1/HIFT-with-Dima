import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { PrescribedMovement, MovementPointsOfPerformance } from '../../types';
import { X, Play, CheckCircle2, Video, Sparkles, ExternalLink, Layers } from 'lucide-react-native';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { HapticsService } from '../../services/hapticsService';
import { MOVEMENT_DATABASE } from '../../engine/movementDatabase';

interface MovementVideoModalProps {
  visible: boolean;
  movement: PrescribedMovement | null;
  onClose: () => void;
}

interface SubMovementDemo {
  key: string;
  name: string;
  videoEmbedId: string;
  videoUrl: string;
  pointsOfPerformance: MovementPointsOfPerformance;
  coachingCues?: string[];
}

export const MovementVideoModal: React.FC<MovementVideoModalProps> = ({
  visible,
  movement,
  onClose,
}) => {
  const [activeSubIndex, setActiveSubIndex] = useState(0);

  // Reset active sub-index when movement changes
  useEffect(() => {
    setActiveSubIndex(0);
  }, [movement]);

  // Decompose combinations / complexes (e.g. "Power Clean + Squat Clean + Split Jerk")
  const subMovements: SubMovementDemo[] = useMemo(() => {
    if (!movement) return [];

    const rawName = movement.name;
    const isComplex = rawName.includes('+') || rawName.includes(' + ');

    if (isComplex) {
      const parts = rawName
        .split('+')
        .map((p) => p.replace(/^\s*\d+\s+/, '').trim())
        .filter(Boolean);

      const resolved: SubMovementDemo[] = [];

      parts.forEach((part, idx) => {
        // Clean part string
        const cleanPart = part.toLowerCase().replace(/^(1|2|3|4|5)\s+/, '').trim();
        
        // Find best match in MOVEMENT_DATABASE
        const def = MOVEMENT_DATABASE.find(
          (d) =>
            d.name.toLowerCase() === cleanPart ||
            cleanPart.includes(d.name.toLowerCase()) ||
            d.name.toLowerCase().includes(cleanPart) ||
            cleanPart.includes(d.id.replace('_', ' ')) ||
            d.id.includes(cleanPart.replace(/\s+/g, '_'))
        );

        if (def) {
          resolved.push({
            key: `sub_${idx}_${def.id}`,
            name: def.name,
            videoEmbedId: def.videoEmbedId || '9Tlhb_nFFe4',
            videoUrl:
              def.videoUrl ||
              `https://www.youtube.com/watch?v=${def.videoEmbedId}&list=PLdWvFCOAvyr3EWQhtfcEMd3DVM5sJdPL4`,
            pointsOfPerformance: def.pointsOfPerformance || {
              setup: 'עמידה ברוחב כתפיים, גב ישר וליבה אסופה ודרוכה.',
              execution: 'פתיחת ירך מתפרצת (Hip Drive) והעברת כוח רציפה מהרגליים לזרועות.',
              standards: 'שבירת מקביל בסקוואט ונעילה מלאה של מפרקי הירך והמרפקים בסיום.',
              commonFaults: 'קריסת ברכיים פנימה או משיכה מוקדמת עם הידיים לפני סיום פתיחת הירך.',
            },
            coachingCues: def.coachingCues,
          });
        } else {
          // Fallback for unlisted part
          resolved.push({
            key: `sub_${idx}_custom`,
            name: part,
            videoEmbedId: '9Tlhb_nFFe4',
            videoUrl: `https://www.youtube.com/results?search_query=CrossFit+${encodeURIComponent(part)}+movement+demo`,
            pointsOfPerformance: {
              setup: 'עמדת מוצא יציבה, גב שטוח וליבה אסופה.',
              execution: 'העברת כוח מהמרכז לקצוות (Core to Extremity).',
              standards: 'ביצוע טווח תנועה מלא ונעילה תקנית.',
              commonFaults: 'איבוד שליטה במרכז הגוף או ירידה רדודה מדי.',
            },
          });
        }
      });

      if (resolved.length > 0) return resolved;
    }

    // Single movement resolution
    const def = MOVEMENT_DATABASE.find(
      (d) =>
        d.id === movement.movementId ||
        d.name.toLowerCase() === movement.name.toLowerCase() ||
        movement.name.toLowerCase().includes(d.name.toLowerCase()) ||
        d.name.toLowerCase().includes(movement.movementId.toLowerCase())
    );

    const videoId = movement.videoEmbedId || def?.videoEmbedId || '9Tlhb_nFFe4';
    const videoUrl =
      movement.videoUrl ||
      def?.videoUrl ||
      `https://www.youtube.com/watch?v=${videoId}&list=PLdWvFCOAvyr3EWQhtfcEMd3DVM5sJdPL4`;

    const points = movement.pointsOfPerformance || def?.pointsOfPerformance || {
      setup: 'עמידה ברוחב כתפיים, גב ישר וליבה אסופה ודרוכה.',
      execution: 'פתיחת ירך מתפרצת (Hip Drive) והעברת כוח רציפה מהרגליים לזרועות.',
      standards: 'שבירת מקביל בסקוואט ונעילה מלאה של מפרקי הירך והמרפקים בסיום.',
      commonFaults: 'קריסת ברכיים פנימה או משיכה מוקדמת עם הידיים לפני סיום פתיחת הירך.',
    };

    return [
      {
        key: 'single_0',
        name: movement.name,
        videoEmbedId: videoId,
        videoUrl,
        pointsOfPerformance: points,
        coachingCues: movement.coachingCues || def?.coachingCues,
      },
    ];
  }, [movement]);

  if (!movement || subMovements.length === 0) return null;

  const currentItem = subMovements[activeSubIndex] || subMovements[0];
  const embedUrl = `https://www.youtube-nocookie.com/embed/${currentItem.videoEmbedId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleGroup}>
              <View style={styles.badgeRow}>
                <Badge
                  label={subMovements.length > 1 ? `קומפלקס (${subMovements.length} תרגילים)` : 'הדגמת תנועה'}
                  variant="neon"
                  size="sm"
                />
              </View>
              <Text style={styles.movementTitle}>{movement.name}</Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                HapticsService.countdownTick();
                onClose();
              }}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* 📑 Complex Sub-Movements Tab Selector (If more than 1 movement) */}
            {subMovements.length > 1 && (
              <View style={styles.complexTabsContainer}>
                <View style={styles.complexTabsHeader}>
                  <Layers size={14} color={COLORS.cyanElectric} />
                  <Text style={styles.complexTabsTitle}>בחר שלב בקומפלקס לצפייה בהדגמה ייעודית:</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
                  {subMovements.map((sub, idx) => {
                    const isSelected = idx === activeSubIndex;
                    return (
                      <TouchableOpacity
                        key={sub.key}
                        onPress={() => {
                          HapticsService.roundIncrement();
                          setActiveSubIndex(idx);
                        }}
                        style={[styles.subTabBtn, isSelected && styles.subTabBtnActive]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.subTabIndex, isSelected && styles.subTabIndexActive]}>
                          {idx + 1}
                        </Text>
                        <Text style={[styles.subTabLabel, isSelected && styles.subTabLabelActive]}>
                          {sub.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* 🎥 Video Player Container */}
            <View style={styles.videoContainer}>
              {Platform.OS === 'web' ? (
                // @ts-ignore - Web iframe embed
                <iframe
                  key={currentItem.videoEmbedId}
                  src={embedUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 0,
                    borderRadius: RADIUS.md,
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={currentItem.name}
                />
              ) : (
                <View style={styles.nativeVideoPlaceholder}>
                  <Video size={48} color={COLORS.neonLime} />
                  <Text style={styles.videoPlaceholderText}>צפה בהדגמת {currentItem.name}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (typeof window !== 'undefined') window.open(currentItem.videoUrl, '_blank');
                    }}
                    style={styles.openExternalBtn}
                  >
                    <Play size={16} color="#000" fill="#000" />
                    <Text style={styles.openExternalText}>פתח סרטון ב-YouTube</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* External Watch Link */}
            <TouchableOpacity
              onPress={() => {
                if (typeof window !== 'undefined') window.open(currentItem.videoUrl, '_blank');
              }}
              style={styles.externalLinkRow}
            >
              <ExternalLink size={14} color={COLORS.cyanElectric} />
              <Text style={styles.externalLinkText}>
                פתח את הדגמת {currentItem.name} ב-YouTube (HD Demo)
              </Text>
            </TouchableOpacity>

            {/* 📋 דגשי ביצוע ביומכניים (Points of Performance - RTL) */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <CheckCircle2 size={16} color={COLORS.neonLime} />
                <Text style={styles.sectionTitle}>
                  דגשי ביצוע עבור {currentItem.name} (Points of Performance):
                </Text>
              </View>

              <View style={styles.pointsList}>
                {/* 1. עמדת מוצא */}
                <View style={styles.pointItem}>
                  <View
                    style={[
                      styles.pointBadge,
                      { backgroundColor: 'rgba(0, 229, 255, 0.15)', borderColor: COLORS.cyanElectric },
                    ]}
                  >
                    <Text style={[styles.pointBadgeText, { color: COLORS.cyanElectric }]}>מוצא</Text>
                  </View>
                  <View style={styles.pointTextCol}>
                    <Text style={styles.pointLabel}>עמדת מוצא (Setup):</Text>
                    <Text style={styles.pointDesc}>{currentItem.pointsOfPerformance.setup}</Text>
                  </View>
                </View>

                {/* 2. ביצוע ומסלול תנועה */}
                <View style={styles.pointItem}>
                  <View
                    style={[
                      styles.pointBadge,
                      { backgroundColor: 'rgba(204, 255, 0, 0.15)', borderColor: COLORS.neonLime },
                    ]}
                  >
                    <Text style={[styles.pointBadgeText, { color: COLORS.neonLime }]}>ביצוע</Text>
                  </View>
                  <View style={styles.pointTextCol}>
                    <Text style={styles.pointLabel}>ביצוע ומסלול תנועה (Execution):</Text>
                    <Text style={styles.pointDesc}>{currentItem.pointsOfPerformance.execution}</Text>
                  </View>
                </View>

                {/* 3. תקן חזרה ונעילה */}
                <View style={styles.pointItem}>
                  <View
                    style={[
                      styles.pointBadge,
                      { backgroundColor: 'rgba(34, 197, 94, 0.15)', borderColor: '#22c55e' },
                    ]}
                  >
                    <Text style={[styles.pointBadgeText, { color: '#22c55e' }]}>תקן</Text>
                  </View>
                  <View style={styles.pointTextCol}>
                    <Text style={styles.pointLabel}>תקן חזרה ונעילה (Rep Standards):</Text>
                    <Text style={styles.pointDesc}>{currentItem.pointsOfPerformance.standards}</Text>
                  </View>
                </View>

                {/* 4. טעויות נפוצות */}
                <View style={styles.pointItem}>
                  <View
                    style={[
                      styles.pointBadge,
                      { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#ef4444' },
                    ]}
                  >
                    <Text style={[styles.pointBadgeText, { color: '#ef4444' }]}>זהירות</Text>
                  </View>
                  <View style={styles.pointTextCol}>
                    <Text style={[styles.pointLabel, { color: '#ef4444' }]}>טעויות נפוצות למניעת פציעה:</Text>
                    <Text style={styles.pointDesc}>{currentItem.pointsOfPerformance.commonFaults}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Coaching Cues */}
            {currentItem.coachingCues && currentItem.coachingCues.length > 0 && (
              <View style={styles.cuesCard}>
                <View style={styles.sectionHeaderRow}>
                  <Sparkles size={16} color={COLORS.cyanElectric} />
                  <Text style={styles.cuesTitle}>דגשי מאמן עבור {currentItem.name}:</Text>
                </View>
                {currentItem.coachingCues.map((cue, idx) => (
                  <View key={idx} style={styles.cueRow}>
                    <View style={styles.cueDot} />
                    <Text style={styles.cueText}>{cue}</Text>
                  </View>
                ))}
              </View>
            )}

            <Button
              title="הבנתי, חזרה לאימון"
              variant="primary"
              size="lg"
              onPress={onClose}
              style={styles.closeActionBtn}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '92%',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
    paddingBottom: SPACING.sm,
  },
  titleGroup: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  movementTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  closeBtn: {
    padding: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceElevated,
  },
  scrollBody: {
    marginBottom: SPACING.sm,
  },
  complexTabsContainer: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  complexTabsHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  complexTabsTitle: {
    color: COLORS.cyanElectric,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: SPACING.xs + 2,
    paddingVertical: 2,
  },
  subTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  subTabBtnActive: {
    backgroundColor: 'rgba(204, 255, 0, 0.15)',
    borderColor: COLORS.neonLime,
  },
  subTabIndex: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '900',
    backgroundColor: COLORS.surfaceElevated,
    width: 18,
    height: 18,
    borderRadius: 9,
    textAlign: 'center',
    lineHeight: 18,
  },
  subTabIndexActive: {
    backgroundColor: COLORS.neonLime,
    color: '#000000',
  },
  subTabLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  subTabLabelActive: {
    color: COLORS.neonLime,
    fontWeight: '900',
  },
  videoContainer: {
    width: '100%',
    height: 230,
    backgroundColor: '#000000',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(204, 255, 0, 0.3)',
    marginBottom: SPACING.sm,
  },
  nativeVideoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  videoPlaceholderText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  openExternalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.neonLime,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  openExternalText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
  },
  externalLinkRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: SPACING.md,
  },
  externalLinkText: {
    color: COLORS.cyanElectric,
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  sectionHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm + 2,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  pointsList: {
    gap: SPACING.sm + 2,
  },
  pointItem: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 8,
  },
  pointBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    minWidth: 44,
    alignItems: 'center',
    marginTop: 2,
  },
  pointBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  pointTextCol: {
    flex: 1,
  },
  pointLabel: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: 2,
  },
  pointDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'right',
  },
  cuesCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  cuesTitle: {
    color: COLORS.cyanElectric,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  cueRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginVertical: 3,
  },
  cueDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.cyanElectric,
  },
  cueText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    flex: 1,
    textAlign: 'right',
  },
  closeActionBtn: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
});
