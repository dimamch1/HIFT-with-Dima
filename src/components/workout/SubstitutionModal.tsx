import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { PrescribedMovement } from '../../types';
import { X, CheckCircle, ArrowRight } from 'lucide-react-native';
import { HapticsService } from '../../services/hapticsService';

interface SubstitutionModalProps {
  visible: boolean;
  movement: PrescribedMovement | null;
  onClose: () => void;
  onSelectSubstitute: (originalMovementId: string, substituteMovementId: string) => void;
}

export const SubstitutionModal: React.FC<SubstitutionModalProps> = ({
  visible,
  movement,
  onClose,
  onSelectSubstitute,
}) => {
  if (!movement) return null;

  const handleSelect = (subId: string) => {
    HapticsService.countdownTick();
    onSelectSubstitute(movement.movementId, subId);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Biomechanical Substitution</Text>
              <Text style={styles.subtitle}>Original: {movement.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.scroll}>
            <Text style={styles.instruction}>
              Select an equivalent movement matching the same metabolic stimulus and joint angle:
            </Text>

            {movement.substitutionsAvailable && movement.substitutionsAvailable.length > 0 ? (
              movement.substitutionsAvailable.map((sub) => (
                <TouchableOpacity
                  key={sub.id}
                  onPress={() => handleSelect(sub.id)}
                  style={styles.subItem}
                  activeOpacity={0.7}
                >
                  <View style={styles.subInfo}>
                    <Text style={styles.subName}>{sub.name}</Text>
                    <Text style={styles.subNotes}>{sub.notes}</Text>
                  </View>
                  <ArrowRight size={18} color={COLORS.neonLime} />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No direct substitutions recorded for this movement.</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
    paddingBottom: SPACING.md,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.neonLime,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  scroll: {
    marginTop: SPACING.md,
  },
  instruction: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: SPACING.md,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceElevated,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  subInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  subName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  subNotes: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});
