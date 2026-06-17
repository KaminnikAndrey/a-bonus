import { login } from '@/services/auth/authApi';
import { UserRole } from '@/services/types';

describe('authApi.login (dev mock)', () => {
  it('accepts mock-student with any non-empty password', async () => {
    const result = await login('mock-student', 'x');
    expect(result.success).toBe(true);
    expect(result.data?.user.role).toBe(UserRole.STUDENT);
    expect(result.data?.user.login).toBe('mock-student');
  });

  it('accepts mock-teacher', async () => {
    const result = await login('  MOCK-TEACHER  ', 'pass');
    expect(result.success).toBe(true);
    expect(result.data?.user.role).toBe(UserRole.TEACHER);
  });

  it('rejects empty password for mock logins', async () => {
    const result = await login('mock-student', '   ');
    expect(result.success).toBe(false);
  });

  it('rejects unknown login without hitting network in test', async () => {
    const result = await login('unknown-user-xyz', 'pass');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
