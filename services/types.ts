export enum UserRole {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export interface UserDTO {
  id?: number;
  login: string;
  password?: string; // writeOnly
  role: UserRole;
  first_name: string;
  last_name: string;
  middle_name?: string;
  full_name?: string; // readOnly
  email: string;
  date_of_birth?: string; // format: date
  coins?: number; // readOnly
}

export interface PageGroupDto {
  totalElements?: number;
  totalPages?: number;
  pageable?: PageableObject;
  first?: boolean;
  last?: boolean;
  size?: number;
  content?: GroupDTO[];
  number?: number;
  sort?: SortObject[];
  numberOfElements?: number;
  empty?: boolean;
}

export interface GroupDTO {
  id?: number; // readOnly
  group_name: string;
  teacher_id?: number; // writeOnly
  teacher?: UserDTO;
  students?: UserDTO[]; // readOnly
}

export interface CreateGroupRequest {
  group_name: string;
  teacher_id: number;
}

export interface PhotoResponse {
  id: number;
}

export interface PresentResponse {
  id: number;
  name: string;
  priceCoins: number;
  stock: number;
  photoIds: PhotoResponse[];
}

export interface PresentUpdateRequest {
  name?: string;
  priceCoins?: number;
  stock?: number;
}

export interface ErrorResponse {
  code: string;
  message: string;
  timestamp: string;
}

export interface EnrollmentHistoryDTO {
  id?: number; // readOnly
  teacher_name: string;
  student_name: string;
  enrolled_coins: number;
  date: string; // format: date-time
}

export enum OrderStatus {
  ORDERED = 'ORDERED',
  CONFIRMED = 'CONFIRMED',
  ISSUED = 'ISSUED',
  CANCELLED = 'CANCELLED',
}

export interface OrderDTO {
  id?: number; // readOnly
  customer?: UserDTO;
  present_id?: number; // readOnly
  status: OrderStatus;
  date?: string; // format: date-time
}

export interface SortObject {
  direction?: string;
  nullHandling?: string;
  ascending?: boolean;
  property?: string;
  ignoreCase?: boolean;
}

export interface PageableObject {
  paged?: boolean;
  pageNumber?: number;
  pageSize?: number;
  offset?: number;
  sort?: SortObject[];
  unpaged?: boolean;
}

export interface PageOrderDTO {
  totalElements?: number;
  totalPages?: number;
  pageable?: PageableObject;
  first?: boolean;
  last?: boolean;
  size?: number;
  content?: OrderDTO[];
  number?: number;
  sort?: SortObject[];
  numberOfElements?: number;
  empty?: boolean;
}

export interface PagePresentDTO {
  totalElements?: number;
  totalPages?: number;
  pageable?: PageableObject;
  first?: boolean;
  last?: boolean;
  size?: number;
  content?: PresentResponse[];
  number?: number;
  sort?: SortObject[];
  numberOfElements?: number;
  empty?: boolean;
}

export interface PageEnrollmentHistoryDTO {
  totalElements?: number;
  totalPages?: number;
  pageable?: PageableObject;
  first?: boolean;
  last?: boolean;
  size?: number;
  content?: EnrollmentHistoryDTO[];
  number?: number;
  sort?: SortObject[];
  numberOfElements?: number;
  empty?: boolean;
}

