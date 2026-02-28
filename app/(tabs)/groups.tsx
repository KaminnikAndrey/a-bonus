import CustomModal from '@/components/common/CustomModal';
import GroupListItemButton, { Group } from '@/components/group/GroupListItemButton';
import StudentListItem, { Student } from '@/components/group/StudentListItem';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAllGroups, getAllStudentsByGroup, giveCoinsToStudens } from '@/services/groups/groupsApi';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GroupsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupsList, setGroupsList] = useState<Group[]>([]);
  const [studentList, setStudentList] = useState<Student[]>([]);

  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [isGroupsLoading, setIsGroupsLoading] = useState(false);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const closeConfirmModal = () => {
    setIsConfirmModalVisible(false);
  }

  const closeSuccessModal = () => {
    setSuccessModalVisible(false);
  }

  const fetchGroups = async (page: number = 0) => {
    setIsGroupsLoading(true);
    const { success, data, pagination } = await getAllGroups(page);
    if (success && data.length > 0) {
      setGroupsList(prev =>{
        return [
          ...new Map(
            [...prev, ...data].map(item => [item.id, item])
          ).values()
        ]
      });
      if (!selectedGroupId) {
        setSelectedGroupId(data[0].id);
      }
    }
    setIsGroupsLoading(false);

    if (pagination) {
      setHasMore(pagination.hasMore);
      setCurrentPage(pagination.currentPage);
    }
  }

  const fetchStudents = async () => {
    if (selectedGroupId) {
      setIsStudentsLoading(true);
      const { success, data } = await getAllStudentsByGroup(selectedGroupId);
      if (success) {
        setStudentList(data)
      }
      setIsStudentsLoading(false);
    }
  }

  const handleLoadMore = async () => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      await fetchGroups(currentPage + 1);
      setIsLoadingMore(false);
    }
  }

  useEffect(() => {
    fetchGroups();
  }, [])

  useEffect(() => {
    fetchStudents();
  }, [selectedGroupId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchGroups();
    if (selectedGroupId) {
      await fetchStudents();
    }
    setIsRefreshing(false);
  }

  const setStudentCoins = (id: string, input: string) => {
    const numericInput = input.replace(/[^0-9]/g, '');

    const value = numericInput === '' ? 0 : parseInt(numericInput, 10);

    let finalValue = '';
    if (input !== null) {
      if (value > 10) {
        finalValue = '10';
      } else if (value < 0) {
        finalValue = '0';
      } else {
        finalValue = value.toString();
      }
    }
    setStudentList(prev =>
      prev.map(student =>
        student.id === id ? { ...student, coins: finalValue } : student
      )
    );
  }

  const onHandleSubmit = async () => {
    closeConfirmModal();
    const { success } = await giveCoinsToStudens(selectedGroupId as string, studentList);
    if (success) {
      setSuccessModalVisible(true);
    }
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Группы</Text>
      </View>
      <View style={styles.content}>
        {isGroupsLoading ? <ActivityIndicator color={"#6766AA"} size={'large'} /> :
          groupsList.length <= 0 ?
            <Text style={[styles.subtitle, { color: colors.text }]}>
              Вы не закреплены ни за одной группой. Свяжитесь с администратором.
            </Text>
            :
            <View style={styles.mainContent}>
              <FlatList
                style={styles.groupContainer}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={groupsList}
                renderItem={({ item }) => <GroupListItemButton id={item.id} name={item.name} isSelected={item.id == selectedGroupId} setSelectedGroupId={setSelectedGroupId} />}
              />

              {isStudentsLoading ? <ActivityIndicator color={"#6766AA"} size={'large'} /> :
                <FlatList
                  style={styles.studentListContainer}
                  showsVerticalScrollIndicator={false}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.5}
                  data={studentList}
                  renderItem={({ item }) => <StudentListItem id={item.id} fullname={item.fullname} coins={item.coins} changeStudentCoins={setStudentCoins} />}
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                />
              }

              {selectedGroupId != null &&
                <TouchableOpacity style={styles.submitButton} onPress={() => { setIsConfirmModalVisible(true) }}>
                  <Text style={styles.submitButtonText}>Зачислить алгокойны</Text>
                </TouchableOpacity>
              }
            </View>
        }
      </View>
      {/* Модальное окно подтверждения*/}
      <CustomModal
        onRequestClose={closeConfirmModal}
        onSuccessModalClose={onHandleSubmit}
        visible={isConfirmModalVisible}
        title={"Подтвердить зачисление"}
        subtitle={"Подтвердить зачисление алгокоинов?"}
        okButtonText={"Подтвердить"}
        isNeedCancelButton={true}
        cancelButtonText={"Отмена"}
        onCancel={closeConfirmModal}
      />

      {/* Модальное окно успешного изменения*/}
      <CustomModal
        onRequestClose={closeSuccessModal}
        onSuccessModalClose={closeSuccessModal}
        visible={successModalVisible}
        title={"Успешно!"}
        subtitle={"Вы успешно зачислили алгокоины ученикам"}
        okButtonText={"Ок"}
        isNeedCancelButton={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  groupContainer: {
    paddingHorizontal: 8,
    maxHeight: 60,
    minHeight: 60
  },
  mainContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between'
  },
  submitButton: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  studentListContainer: {
    flex: 1,
    paddingHorizontal: 12
  }
});
