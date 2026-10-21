import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    friend_name: string;
    amount: number;
    due_date: string;
    notes?: string;
    receipt_url?: string;
  }) => Promise<void>;
}

export const AddLoanModal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
  const [friendName, setFriendName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    // Default to 14 days in future
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!friendName.trim() || friendName.trim().length < 2) {
      errs.friendName = 'Friend name is required (min 2 chars)';
    }
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      errs.amount = 'Please enter a valid amount greater than 0';
    }
    if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      errs.dueDate = 'Due date must follow YYYY-MM-DD';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        friend_name: friendName.trim(),
        amount: parseFloat(amount),
        due_date: dueDate,
        notes: notes.trim() || undefined,
        receipt_url: receiptUrl.trim() || undefined,
      });
      // Reset form
      setFriendName('');
      setAmount('');
      setNotes('');
      setReceiptUrl('');
      setErrors({});
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create loan entry');
    } finally {
      setLoading(false);
    }
  };

  const handleAttachSampleReceipt = () => {
    setReceiptUrl('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.dragHandle} />
          <View style={styles.header}>
            <Text style={styles.title}>Lend Money to Friend</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Friend Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Friend's Name *</Text>
              <TextInput
                style={[styles.input, errors.friendName && styles.inputError]}
                placeholder="e.g. Rahul Verma"
                value={friendName}
                onChangeText={setFriendName}
                placeholderTextColor="#94A3B8"
              />
              {errors.friendName && <Text style={styles.errorText}>{errors.friendName}</Text>}
            </View>

            {/* Amount */}
            <View style={styles.field}>
              <Text style={styles.label}>Amount Lent (₹) *</Text>
              <TextInput
                style={[styles.input, errors.amount && styles.inputError]}
                placeholder="e.g. 5000"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholderTextColor="#94A3B8"
              />
              {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
            </View>

            {/* Due Date */}
            <View style={styles.field}>
              <Text style={styles.label}>Expected Repayment Date (YYYY-MM-DD) *</Text>
              <TextInput
                style={[styles.input, errors.dueDate && styles.inputError]}
                placeholder="YYYY-MM-DD"
                value={dueDate}
                onChangeText={setDueDate}
                placeholderTextColor="#94A3B8"
              />
              {errors.dueDate && <Text style={styles.errorText}>{errors.dueDate}</Text>}
            </View>

            {/* Notes */}
            <View style={styles.field}>
              <Text style={styles.label}>Reason / Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="e.g. Concert tickets, dinner bill, college fee"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Receipt Photo Bonus */}
            <View style={styles.field}>
              <View style={styles.receiptLabelRow}>
                <Text style={styles.label}>Receipt Photo (Bonus)</Text>
                <TouchableOpacity onPress={handleAttachSampleReceipt}>
                  <Text style={styles.sampleLink}>+ Attach Sample</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Photo URL or image link"
                value={receiptUrl}
                onChangeText={setReceiptUrl}
                placeholderTextColor="#94A3B8"
              />
              {receiptUrl ? (
                <Text style={styles.receiptAttachedText}>✓ Photo receipt attached</Text>
              ) : null}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>Confirm & Add to Ledger</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '600',
  },
  body: {
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  receiptLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sampleLink: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  multilineInput: {
    height: 64,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  receiptAttachedText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
