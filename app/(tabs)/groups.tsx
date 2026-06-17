import CustomModal from '@/components/common/CustomModal';
import GroupListItemButton, { Group } from '@/components/group/GroupListItemButton';
import StudentListItem, { Student } from '@/components/group/StudentListItem';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAllGroups, getAllStudentsByGroup, giveCoinsToStudens } from '@/services/groups/groupsApi';
import { userSelector } from '@/stores/auth/authStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const CTA_PURPLE = '#6766AA';
const INPUT_RADIUS = 14;

/** Сумма к зачислению: при загрузке группы всегда с нуля. */
function studentsWithZeroCoins(data: Student[]): Student[] {
  return data.map((s) => ({ ...s, coins: '0' }));
}

export default function GroupsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const user = useSelector(userSelector);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupsList, setGroupsList] = useState<Group[]>([]);
  const [studentList, setStudentList] = useState<Student[]>([]);

  const [bulkStudentId, setBulkStudentId] = useState<string | null>(null);
  const [bulkAmount, setBulkAmount] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [isGroupsLoading, setIsGroupsLoading] = useState(false);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const closeConfirmModal = () => setIsConfirmModalVisible(false);
  const closeSuccessModal = () => setSuccessModalVisible(false);

  const fetchGroups = useCallback(
    async (page: number = 0, resetList = false) => {
      setIsGroupsLoading(true);
      if (resetList && page === 0) {
        setGroupsList([]);
        setSelectedGroupId(null);
        setCurrentPage(0);
        setHasMore(true);
      }
      const { success, data, pagination } = await getAllGroups(page, 20);
      if (success && data.length > 0) {
        setGroupsList((prev) => {
          const base = resetList && page === 0 ? [] : prev;
          return [...new Map([...base, ...data].map((item) => [item.id, item])).values()];
        });
        setSelectedGroupId((prev) => {
          if (prev && !resetList) return prev;
          return data[0].id;
        });
      }
      setIsGroupsLoading(false);

      if (pagination) {
        setHasMore(pagination.hasMore);
        setCurrentPage(pagination.currentPage);
      }
    },
    []
  );

  const fetchStudents = useCallback(async () => {
    if (selectedGroupId) {
      setIsStudentsLoading(true);
      const { success, data } = await getAllStudentsByGroup(selectedGroupId);
      if (success) {
        setStudentList(studentsWithZeroCoins(data));
        setBulkStudentId(null);
        setBulkAmount('');
      }
      setIsStudentsLoading(false);
    }
  }, [selectedGroupId]);

  const handleLoadMore = async () => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      await fetchGroups(currentPage + 1);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const role = String(user?.role ?? '').toLowerCase();
    if (role !== 'teacher' || !user?.id) return;
    void fetchGroups(0, true);
  }, [user?.role, user?.id, fetchGroups]);

  useEffect(() => {
    void fetchStudents();
  }, [selectedGroupId, fetchStudents]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchGroups(0, true);
    if (selectedGroupId) {
      await fetchStudents();
    }
    setIsRefreshing(false);
  };

  const bumpCoins = useCallback((id: string, delta: number) => {
    setStudentList((prev) =>
      prev.map((student) => {
        if (student.id !== id) return student;
        const cur = parseInt(student.coins || '0', 10) || 0;
        const next = Math.max(0, Math.min(10, cur + delta));
        return { ...student, coins: String(next) };
      })
    );
  }, []);

  const mergeBulkIntoList = useCallback(() => {
    if (!bulkStudentId) return;
    const add = parseInt(bulkAmount.replace(/[^0-9]/g, ''), 10) || 0;
    if (add <= 0) return;
    setStudentList((prev) =>
      prev.map((s) => {
        if (s.id !== bulkStudentId) return s;
        const cur = parseInt(s.coins || '0', 10) || 0;
        return { ...s, coins: String(Math.min(10, cur + add)) };
      })
    );
    setBulkAmount('');
  }, [bulkStudentId, bulkAmount]);

  const bulkStudentLabel = useMemo(() => {
    if (!bulkStudentId) return null;
    return studentList.find((s) => s.id === bulkStudentId)?.fullname ?? null;
  }, [bulkStudentId, studentList]);

  const openCreditFlow = () => {
    mergeBulkIntoList();
    setIsConfirmModalVisible(true);
  };

  const onHandleSubmit = async () => {
    closeConfirmModal();
    const { success } = await giveCoinsToStudens(selectedGroupId as string, studentList);
    if (success) {
      setSuccessModalVisible(true);
      setStudentList((prev) => studentsWithZeroCoins(prev));
      setBulkStudentId(null);
      setBulkAmount('');
    }
  };

  const inputShell = {
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.text,
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Группы</Text>
      </View>

      {isGroupsLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={CTA_PURPLE} size="large" />
        </View>
      ) : groupsList.length <= 0 ? (
        <View style={styles.centered}>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Вы не закреплены ни за одной группой. Свяжитесь с администратором.
          </Text>
        </View>
      ) : (
        <View style={styles.main}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={groupsList}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.groupChipsContent}
            style={styles.groupChips}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            renderItem={({ item }) => (
              <GroupListItemButton
                id={item.id}
                name={item.name}
                isSelected={item.id === selectedGroupId}
                setSelectedGroupId={setSelectedGroupId}
                colors={colors}
              />
            )}
          />

          {isStudentsLoading ? (
            <View style={styles.listFlexCenter}>
              <ActivityIndicator color={CTA_PURPLE} size="large" />
            </View>
          ) : (
            <FlatList
              style={styles.studentList}
              contentContainerStyle={styles.studentListContent}
              data={studentList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <StudentListItem
                  id={item.id}
                  fullname={item.fullname}
                  coins={item.coins}
                  colors={colors}
                  bumpCoins={bumpCoins}
                />
              )}
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              ListFooterComponent={<View style={{ height: 8 }} />}
            />
          )}

          {selectedGroupId != null && (
            <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
              <View style={styles.bulkRow}>
                <Pressable
                  onPress={() => setPickerOpen(true)}
                  style={[styles.selectField, inputShell]}
                  accessibilityLabel="Выберите ученика">
                  <Text
                    style={[
                      styles.selectFieldText,
                      { color: bulkStudentLabel ? colors.text : colors.placeholder },
                    ]}
                    numberOfLines={1}>
                    {bulkStudentLabel ?? 'Выберите ученика'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.placeholder} />
                </Pressable>
                <TextInput
                  style={[styles.amountField, inputShell]}
                  placeholder="Кол-во"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                  value={bulkAmount}
                  onChangeText={setBulkAmount}
                />
              </View>
              <TouchableOpacity style={styles.submitButton} activeOpacity={0.88} onPress={openCreditFlow}>
                <Text style={styles.submitButtonText}>Зачислить алгокоины</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {pickerOpen ? (
        <Modal transparent animationType="fade" visible onRequestClose={() => setPickerOpen(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)}>
            <Pressable
              style={[styles.modalCard, { backgroundColor: colors.background }]}
              onPress={(e) => e.stopPropagation()}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Ученик</Text>
              <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
                {studentList.map((s) => (
                  <Pressable
                    key={s.id}
                    style={styles.modalRow}
                    onPress={() => {
                      setBulkStudentId(s.id);
                      setPickerOpen(false);
                    }}>
                    <Text style={[styles.modalRowText, { color: colors.text }]} numberOfLines={2}>
                      {s.fullname}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      <CustomModal
        onRequestClose={closeConfirmModal}
        onSuccessModalClose={onHandleSubmit}
        visible={isConfirmModalVisible}
        title="Подтвердить зачисление"
        subtitle="Подтвердить зачисление алгокоинов?"
        okButtonText="Подтвердить"
        isNeedCancelButton={true}
        cancelButtonText="Отмена"
        onCancel={closeConfirmModal}
      />

      <CustomModal
        onRequestClose={closeSuccessModal}
        onSuccessModalClose={closeSuccessModal}
        visible={successModalVisible}
        title="Успешно!"
        subtitle="Вы успешно зачислили алгокоины ученикам"
        okButtonText="Ок"
        isNeedCancelButton={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  main: {
    flex: 1,
    minHeight: 0,
  },
  groupChips: {
    maxHeight: 52,
    flexGrow: 0,
  },
  groupChipsContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: 'center',
  },
  studentList: {
    flex: 1,
    minHeight: 0,
  },
  studentListContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  listFlexCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  bulkRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  selectField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: INPUT_RADIUS,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  selectFieldText: {
    flex: 1,
    fontSize: 15,
    marginRight: 8,
  },
  amountField: {
    width: 100,
    borderRadius: INPUT_RADIUS,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    textAlign: 'center',
    minHeight: 50,
  },
  submitButton: {
    backgroundColor: CTA_PURPLE,
    paddingVertical: 16,
    borderRadius: INPUT_RADIUS,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 16,
    maxHeight: '70%',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  modalList: {
    maxHeight: 360,
  },
  modalRow: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  modalRowText: {
    fontSize: 16,
  },
});
