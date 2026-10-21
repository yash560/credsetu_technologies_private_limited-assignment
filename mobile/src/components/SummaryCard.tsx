import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Summary } from '../types';

interface Props {
  summary: Summary | null;
}

export const SummaryCard: React.FC<Props> = ({ summary }) => {
  const totalLent = summary?.total_lent || 0;
  const totalRepaid = summary?.total_repaid || 0;
  const overdueAmount = summary?.overdue_amount || 0;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>MiniLedger Portfolio</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Real-Time</Text>
        </View>
      </View>

      <View style={styles.primaryMetric}>
        <Text style={styles.label}>TOTAL OUTSTANDING / LENT</Text>
        <Text style={styles.amount}>₹{totalLent.toLocaleString('en-IN')}</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>REPAID</Text>
          <Text style={[styles.statValue, styles.repaidValue]}>
            ₹{totalRepaid.toLocaleString('en-IN')}
          </Text>
        </View>

        <View style={[styles.statBox, styles.overdueBox]}>
          <Text style={[styles.statLabel, styles.overdueLabel]}>OVERDUE</Text>
          <Text style={[styles.statValue, styles.overdueValue]}>
            ₹{overdueAmount.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1B4B',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#A5B4FC',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(165, 180, 252, 0.3)',
  },
  badgeText: {
    color: '#E0E7FF',
    fontSize: 11,
    fontWeight: '700',
  },
  primaryMetric: {
    marginBottom: 16,
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    padding: 12,
    borderRadius: 14,
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  repaidValue: {
    color: '#34D399',
  },
  overdueBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  overdueLabel: {
    color: '#FCA5A5',
  },
  overdueValue: {
    color: '#EF4444',
  },
});
