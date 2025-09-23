import { ListResponse } from "./buildResponse";

export interface QueryModifierOptions {
  filter: {
    [column: string]: any;
  };
  sort_by: string;
  order: "asc" | "desc";
  page: number;
  page_size: number;
  search_term?: string;
}

/**
 * Fetch paginated data from a given query builder.
 * This matches the legacy fetch_paginated_data method exactly.
 */
export async function fetch_paginated_data<T>(
  baseQueryBuilder: any,
  options?: Partial<QueryModifierOptions>,
  countQueryBuilder?: any
): Promise<ListResponse<T>> {
  const page = options?.page ?? 1;
  const page_size = options?.page_size ?? 10;

  const rawCountQB = countQueryBuilder ?? baseQueryBuilder;

  const filtered_count_query = apply_query_modifiers(rawCountQB, {
    filter: options?.filter,
  });

  const filtered_data_query = apply_query_modifiers(baseQueryBuilder, options);

  // Run both queries in parallel.
  const [{ count }, { data, error }] = await Promise.all([
    filtered_count_query,
    filtered_data_query,
  ]);

  if (error) {
    throw new Error(`Error fetching data: ${error.message}`);
  }

  const totalItems = count ?? 0;
  const totalPages = Math.ceil(totalItems / page_size);

  return {
    items: data ?? [],
    pageNumber: page,
    totalPages,
    totalItems,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}

/**
 * Apply query modifiers to a Supabase query builder.
 * This matches the legacy apply_query_modifiers method exactly.
 */
export function apply_query_modifiers(
  query: any, // Using any temporarily to avoid type checking complexity
  options?: Partial<QueryModifierOptions>
) {
  let modifiedQuery = query;

  if (options) {
    // Apply filter conditions if they exist and the query has .eq method
    if (options.filter && "eq" in modifiedQuery) {
      Object.keys(options.filter).forEach((column) => {
        modifiedQuery = modifiedQuery.eq(column, options.filter![column]);
      });
    }

    // Apply pagination if both page and page_size are specified and the query has .range method
    if (options.page && options.page_size && "range" in modifiedQuery) {
      const from = (options.page - 1) * options.page_size;
      const to = options.page * options.page_size - 1;
      modifiedQuery = modifiedQuery.range(from, to);
    }
  }

  return modifiedQuery;
}
