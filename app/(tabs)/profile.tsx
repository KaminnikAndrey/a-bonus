import StudentRanksTab from '@/components/profile/StudentRanksTab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getProfileInfo, Profile } from '@/services/profile/profileApi';
import { logout, userSelector } from '@/stores/auth/authStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

type StudentTab = 'main' | 'ranks' | 'awards' | 'history';

const STUDENT_TABS: { key: StudentTab; label: string }[] = [
  { key: 'main', label: 'Основное' },
  { key: 'ranks', label: 'Ранги' },
  { key: 'awards', label: 'Награды' },
  { key: 'history', label: 'История' },
];

/** Демо-история начислений (как в макете «История»). */
const DEMO_HISTORY_SECTIONS: { title: string; rows: { desc: string; amount: string }[] }[] = [
  {
    title: '10 октября 2026',
    rows: [
      { desc: 'За лучший проект в ленте', amount: '+10 EXP' },
      { desc: 'Выполнение ДЗ', amount: '+2 EXP' },
      { desc: 'У вас 200 алгокоинов', amount: '+5 EXP' },
      { desc: 'За занятие', amount: '+9 коинов' },
      { desc: 'За лучший проект в ленте', amount: '5 EXP' },
    ],
  },
  {
    title: '3 октября 2026',
    rows: [{ desc: 'Выполнение ДЗ', amount: '+2 EXP' }],
  },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const user = useSelector(userSelector);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [studentTab, setStudentTab] = useState<StudentTab>('main');
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const { success, data } = await getProfileInfo();
      if (success && data) {
        setProfile(data);
      }
      setIsLoading(false);
    })();
  }, []);

  const onLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  const handleLogout = () => {
    Alert.alert('Выход', 'Вы уверены, что хотите выйти?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Выйти', style: 'destructive', onPress: onLogout },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Пользователь не найден</Text>
      </SafeAreaView>
    );
  }

  const isStudent = user.role === 'student';

  const renderStudentChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsScroll}
      style={styles.chipsBar}
    >
      {STUDENT_TABS.map((tab) => {
        const active = studentTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setStudentTab(tab.key)}
            activeOpacity={0.85}
            style={[
              styles.chip,
              active
                ? [styles.chipFilled, { backgroundColor: '#6766AA' }]
                : [styles.chipOutline, { borderColor: '#A0A0A0' }],
            ]}
          >
            <Text style={[styles.chipLabel, active ? styles.chipLabelActive : { color: '#A0A0A0' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderMainTab = () => (
    <>
      <View style={[styles.algoCard, { borderColor: colors.border }]}>
        <View style={styles.leftSide}>
          <Image source={require('@/assets/images/logo-white.png')} style={styles.logo} />
          <View>
            <Text style={[styles.infoLabel, { color: 'white' }]}>Ваш баланс:</Text>
            <Text style={[styles.infoLabel, { color: 'white' }]}>{profile?.algocoins} алгокоинов</Text>
          </View>
        </View>
        <View style={styles.rightSide}>
          <Image source={require('@/assets/images/robot.png')} style={styles.robot} />
        </View>
      </View>

      <View style={[styles.infoCard, { borderColor: colors.border }]}>
        <Text style={[styles.infoLabel, { color: colors.text }]}>Логин: {profile?.login}</Text>
      </View>
      <View style={[styles.infoCard, { borderColor: colors.border }]}>
        <Text style={[styles.infoLabel, { color: colors.text }]}>ФИО: {profile?.fullName}</Text>
      </View>
      <View style={[styles.infoCard, { borderColor: colors.border }]}>
        <Text style={[styles.infoLabel, { color: colors.text }]}>Email: {profile?.email}</Text>
      </View>
      <View style={[styles.infoCard, { borderColor: colors.border }]}>
        <Text style={[styles.infoLabel, { color: colors.text }]}>Дата рождения: {profile?.birthDate}</Text>
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Выйти</Text>
      </TouchableOpacity>
    </>
  );

  const renderRanksTab = () => (
    <StudentRanksTab
      totalExp={profile?.experiencePoints ?? 0}
      colors={{ text: colors.text, placeholder: colors.placeholder, border: colors.border }}
    />
  );

  const renderAwardsTab = () => (
    <View style={[styles.tabPanel, { borderColor: colors.border }]}>
      <Text style={[styles.mutedText, { color: colors.placeholder }]}>
        Здесь будут награды за ранги и достижения. Раздел в разработке.
      </Text>
    </View>
  );

  const renderHistoryTab = () => (
    <View style={styles.historyWrap}>
      {DEMO_HISTORY_SECTIONS.map((section) => (
        <View key={section.title} style={styles.historySection}>
          <Text style={[styles.historyDate, { color: colors.text }]}>{section.title}</Text>
          <View style={[styles.historyTable, { borderColor: colors.border }]}>
            <View style={[styles.historyHeaderRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.historyColLeft, { color: colors.placeholder }]}>Описание</Text>
              <Text style={[styles.historyColRight, { color: colors.placeholder }]}>Кол-во</Text>
            </View>
            {section.rows.map((row, i) => (
              <View
                key={`${section.title}-${i}`}
                style={[
                  styles.historyRow,
                  i < section.rows.length - 1
                    ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }
                    : null,
                ]}
              >
                <Text style={[styles.historyColLeft, { color: colors.text }]} numberOfLines={2}>
                  {row.desc}
                </Text>
                <Text style={[styles.historyColRight, { color: colors.text }]}>{row.amount}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        {isStudent ? (
          <View style={styles.headerRow}>
            <View style={styles.headerSide} />
            <Text style={[styles.title, styles.titleInRow, { color: colors.text }]}>Профиль</Text>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => router.push('/ranks-info')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Справка о рангах"
            >
              <Ionicons name="information-circle-outline" size={26} color={colors.text} />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={[styles.title, { color: colors.text }]}>Профиль</Text>
        )}
      </View>

      {isStudent ? renderStudentChips() : null}

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#6766AA" size="large" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isStudent ? (
            <>
              {studentTab === 'main' && renderMainTab()}
              {studentTab === 'ranks' && renderRanksTab()}
              {studentTab === 'awards' && renderAwardsTab()}
              {studentTab === 'history' && renderHistoryTab()}
            </>
          ) : (
            <>
              <View style={[styles.infoCard, { borderColor: colors.border }]}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>Логин: {profile?.login}</Text>
              </View>
              <View style={[styles.infoCard, { borderColor: colors.border }]}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>ФИО: {profile?.fullName}</Text>
              </View>
              <View style={[styles.infoCard, { borderColor: colors.border }]}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>Email: {profile?.email}</Text>
              </View>
              <View style={[styles.infoCard, { borderColor: colors.border }]}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>Дата рождения: {profile?.birthDate}</Text>
              </View>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Выйти</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSide: {
    width: 44,
  },
  titleInRow: {
    flex: 1,
    textAlign: 'center',
  },
  infoButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chipsBar: {
    maxHeight: 48,
    marginBottom: 8,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 12,
    alignItems: 'center',
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  chipOutline: {
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  chipFilled: {},
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  chipLabelActive: {
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 61,
    height: 39,
  },
  algoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#6766AA',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    maxHeight: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    paddingRight: 0,
  },
  leftSide: {
    flex: 1,
    justifyContent: 'space-between',
  },
  rightSide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  robot: {
    width: 142,
    height: 142,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  tabPanel: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
  },
  mutedText: {
    fontSize: 15,
    lineHeight: 22,
  },
  historyWrap: {
    gap: 20,
  },
  historySection: {
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  historyTable: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  historyColLeft: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  historyColRight: {
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});
