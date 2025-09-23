import { SupabaseClient } from "@/lib/supabase";
import { Database } from "@/types/database";
import {
  PostgrestBuilder,
  PostgrestFilterBuilder,
} from "@supabase/postgrest-js";
import { ListResponse } from "./buildResponse";


// This type captures all possible Supabase query builder types
type SupabaseQueryResult = PostgrestBuilder<any, any> & {
  select: (
    columns?: string,
    options?: { count?: "exact" | "planned" | "estimated"; head?: boolean }
  ) => any;
};

export type SupabaseQueryBuilder =  PostgrestFilterBuilder<any, any, any, any>;

export interface QueryModifierOptions {
  filter: {
    [column: string]: any;
  };
  sort_by: string;
  order: "asc" | "desc";
  page: number;
  page_size: number;
  search_term?:string
}

class ApiBaseService {
  protected supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Fetch paginated data from a given table.
   *
   * @param baseQueryBuilder - Function that returns a query builder
   * @param options - Query modifier options (filter, sort, pagination).
   */
  protected async fetch_paginated_data<T>(
    baseQueryBuilder: any,
    options?: Partial<QueryModifierOptions>,
    countQueryBuilder?: any
  ): Promise<ListResponse<T>> {
    const page = options?.page ?? 1;
    const page_size = options?.page_size ?? 10;

    const rawCountQB = countQueryBuilder ?? baseQueryBuilder;

    const filtered_count_query = this.apply_query_modifiers(rawCountQB, {
      filter: options?.filter,
    });

    const filtered_data_query = this.apply_query_modifiers(baseQueryBuilder, options);

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

  protected apply_query_modifiers(
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

      // // Apply sorting if sort_by is specified and the query has .order method
      // if (options.sort_by && "order" in modifiedQuery) {
      //   modifiedQuery = modifiedQuery.order(options.sort_by, {
      //     ascending: options.order !== "desc",
      //   });
      // }

      // Apply pagination if both page and page_size are specified and the query has .range method
      if (options.page && options.page_size && "range" in modifiedQuery) {
        const from = (options.page - 1) * options.page_size;
        const to = options.page * options.page_size - 1;
        modifiedQuery = modifiedQuery.range(from, to);
      }
    }

    return modifiedQuery;
  }
}

export default ApiBaseService;
