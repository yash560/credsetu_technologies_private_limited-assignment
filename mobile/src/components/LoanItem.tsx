import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Loan } from '../types';

interface Props {
  loan: Loan;
  onToggleRepaid: (id: string, currentStatus: boolean) => void;
  onPressReceipt?: (url: string) => void;
}

export const LoanItem: React.FC<Props> = ({ loan, onToggleRepaid, onPressReceipt }) => {
  const isOverdue = loan.is_overdue;
  const isRepaid = loan.is_repaid;

  // Format initials
  const initials = loan.friend_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View
      style={[
        styles.card,
        isOverdue && !isRepaid && styles.overdueCard,
        isRepaid && styles.repaidCard,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.leftInfo}>
          <View
            style={[
              styles.avatar,
              isOverdue && !isRepaid ? styles.overdueAvatar : styles.defaultAvatar,
              isRepaid && styles.repaidAvatar,
            ]}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.friendName}>{loan.friend_name}</Text>
            <Text style={styles.dueDateText}>
              Due: {loan.due_date}
              {isOverdue && !isRepaid && (
                <Text style={styles.overdueDays}> • {loan.days_overdue}d Overdue</Text>
              )}
            </Text>
          </View>
        </View>

        <View style={styles.rightInfo}>
          <Text style={[styles.amount, isOverdue && !isRepaid && styles.overdueAmount]}>
            ₹{loan.amount.toLocaleString('en-IN')}
          </Text>
          {isOverdue && !isRepaid && (
            <View style={styles.overdueBadge}>
              <Text style={styles.overdueBadgeText}>OVERDUE</Text>
            </View>
          )}
          {isRepaid && (
            <View style={styles.repaidBadge}>
              <Text style={styles.repaidBadgeText}>✓ REPAID</Text>
            </View>
          )}
        </View>
      </View>

      {loan.notes ? (
        <Text style={styles.notesText} numberOfLines={2}>
          "{loan.notes}"
        </Text>
      ) : null}

      <View style={styles.actionRow}>
        {loan.receipt_url ? (
          <TouchableOpacity
            style={styles.receiptButton}
            onPress={() => onPressReceipt && onPressReceipt(loan.receipt_url!)}
          >
            <Text style={styles.receiptButtonText}>📎 View Receipt</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <TouchableOpacity
          style={[styles.repayButton, isRepaid ? styles.undoButton : styles.markRepaidButton]}
          onPress={() => onToggleRepaid(loan.id, isRepaid)}
        >
          <Text style={[styles.repayButtonText, isRepaid && styles.undoButtonText]}>
            {isRepaid ? 'Mark Unpaid' : '✓ Mark as Repaid'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  overdueCard: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
    backgroundColor: '#FFF5F5',
  },
  repaidCard: {
    opacity: 0.85,
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  defaultAvatar: {
    backgroundColor: '#EEF2FF',
  },
  overdueAvatar: {
    backgroundColor: '#FEE2E2',
  },
  repaidAvatar: {
    backgroundColor: '#ECFDF5',
  },
  avatarText: {
    fontWeight: '700',
    fontSize: 15,
    color: '#334155',
  },
  textContainer: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  dueDateText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  overdueDays: {
    color: '#EF4444',
    fontWeight: '600',
  },
  rightInfo: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  overdueAmount: {
    color: '#EF4444',
  },
  overdueBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  overdueBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  repaidBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  repaidBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  notesText: {
    marginTop: 10,
    fontSize: 13,
    color: '#475569',
    fontStyle: 'italic',
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 8,
    borderRadius: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  receiptButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  receiptButtonText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  repayButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  markRepaidButton: {
    backgroundColor: '#4F46E5',
  },
  undoButton: {
    backgroundColor: '#E2E8F0',
  },
  repayButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  undoButtonText: {
    color: '#475569',
  },
});
