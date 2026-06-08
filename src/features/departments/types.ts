export type DepartmentStatus = "ACTIVE" | "INACTIVE";

export type Department = {
  companyId: number;
  description: string;
  id: number;
  name: string;
  status: DepartmentStatus | string;
  uuid: string;
};

export type DepartmentListData = {
  items?: Department[];
};

export type DepartmentListResponseData = Department[] | DepartmentListData;

export type CreateDepartmentRequest = {
  description: string;
  name: string;
  status: DepartmentStatus;
};

export type UpdateDepartmentRequest = Partial<CreateDepartmentRequest>;
