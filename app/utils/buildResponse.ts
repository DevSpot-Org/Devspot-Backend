import { NextResponse } from "next/server";

export interface ListResponse<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

type BuildResponseData<T> = ListResponse<T> | T;

type BuildResponseOptions<T> = {
  message: string;
  data: BuildResponseData<T>;
  status?: number;
  isError?: boolean;
};

export const buildResponse = <T>(options: BuildResponseOptions<T>) => {
  const { data, message, isError, status } = options;

  const payload = {
    message,
    data,
  };

  if (isError) {
    return NextResponse.json({ error: message, data }, { status: status ?? 400 });
  }

  return NextResponse.json(payload, { status: status ?? 200 });
};
