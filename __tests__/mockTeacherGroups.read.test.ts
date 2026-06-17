import {
  mockGetAllGroups,
  mockGetStudentsByGroup,
} from '@/services/groups/mockTeacherGroups';

describe('mockTeacherGroups (read)', () => {
  it('mockGetAllGroups returns tabs as groups', async () => {
    const result = await mockGetAllGroups(0, 20);
    expect(result.success).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]).toMatchObject({ id: expect.any(String), name: expect.any(String) });
  });

  it('mockGetStudentsByGroup returns students for tg1', async () => {
    const result = await mockGetStudentsByGroup('tg1');
    expect(result.success).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0].fullname).toBeTruthy();
  });
});
