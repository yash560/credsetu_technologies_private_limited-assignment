import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Modal,
  Image,
} from 'react-native';
import { SummaryCard } from '../components/SummaryCard';
import { LoanItem } from '../components/LoanItem';
import { AddLoanModal } from '../components/AddLoanModal';
import { Loan, Summary } from '../types';
import { api } from '../services/api';

interface Props {
  phone: string;
  onLogout: () => void;
}

export const HomeScreen: React.FC<Props> = ({ phone, onLogout }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [filter, setFilter] = useState<'all' | 'overdue' | 'active' | 'repaid'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [receiptModalUrl, setReceiptModalUrl] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [fetchedSummary, fetchedLoans] = await Promise.all([
        api.getSummary(phone),
        api.getLoans(phone, filter),
      ]);
      setSummary(fetchedSummary);
      setLoans(fetchedLoans);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [phone, filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleToggleRepaid = async (id: string, currentRepaid: boolean) => {
    try {
      await api.markRepaid(id, !currentRepaid);
      loadData();
    } catch (err) {
      console.error('Failed to update repayment:', err);
    }
  };

  const handleAddLoan = async (payload: {
    friend_name: string;
    amount: number;
    due_date: string;
    notes?: string;
    receipt_url?: string;
  }) => {
    await api.createLoan(phone, payload);
    loadData();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>MiniLedger</Text>
          <Text style={styles.headerSubtitle}>Logged in: {phone}</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={loans}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
        }
        ListHeaderComponent={
          <>
            <SummaryCard summary={summary} />

            {/* Filter Tabs */}
            <View style={styles.filterRow}>
              {(['all', 'overdue', 'active', 'repaid'] as const).map((tab) => {
                const isActive = filter === tab;
                let count = 0;
                if (summary) {
                  if (tab === 'all') count = summary.total_loans;
                  if (tab === 'overdue') count = summary.overdue_count;
                  if (tab === 'active') count = summary.active_count;
                  if (tab === 'repaid') count = summary.repaid_count;
                }

                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setFilter(tab)}
                    style={[
                      styles.filterTab,
                      isActive && styles.activeFilterTab,
                      tab === 'overdue' && count > 0 && !isActive && styles.overduePillBorder,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        isActive && styles.activeFilterTabText,
                        tab === 'overdue' && count > 0 && styles.overduePillText,
                      ]}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {count > 0 ? ` (${count})` : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {filter === 'all'
                  ? 'All Transactions'
                  : filter === 'overdue'
                  ? '⚠️ Overdue Money Lent'
                  : filter === 'active'
                  ? '⏳ Active Loans'
                  : '✓ Repaid History'}
              </Text>
              <Text style={styles.sectionCount}>{loans.length} entries</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <LoanItem
            loan={item}
            onToggleRepaid={handleToggleRepaid}
            onPressReceipt={setReceiptModalUrl}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#4F46E5" />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🍃</Text>
              <Text style={styles.emptyTitle}>No loans found</Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'overdue'
                  ? 'Great news! You have no overdue debts pending from friends.'
                  : 'Tap "+ Lend Money" below to record your first loan entry.'}
              </Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsAddModalOpen(true)}>
        <Text style={styles.fabIcon}>+</Text>
        <Text style={styles.fabText}>Lend Money</Text>
      </TouchableOpacity>

      {/* Add Loan Modal */}
      <AddLoanModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddLoan}
      />

      {/* Receipt Modal */}
      <Modal visible={Boolean(receiptModalUrl)} transparent animationType="fade">
        <View style={styles.receiptOverlay}>
          <View style={styles.receiptBox}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptTitle}>📎 Attached Receipt / Proof</Text>
              <TouchableOpacity onPress={() => setReceiptModalUrl(null)}>
                <Text style={styles.closeReceiptText}>✕</Text>
              </TouchableOpacity>
            </View>
            {receiptModalUrl && (
              <Image source={{ uri: receiptModalUrl }} style={styles.receiptImage} resizeMode="contain" />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 8,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  activeFilterTab: {
    backgroundColor: '#4F46E5',
  },
  overduePillBorder: {
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  overduePillText: {
    color: '#EF4444',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionCount: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 28,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginRight: 6,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  receiptOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  receiptBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    width: '100%',
    maxWidth: 400,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  receiptTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeReceiptText: {
    fontSize: 18,
    color: '#64748B',
    padding: 4,
  },
  receiptImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
});
