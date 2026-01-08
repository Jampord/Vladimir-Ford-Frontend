import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const warehouseApi = createApi({
  reducerPath: "warehouseApi",
  tagTypes: ["Warehouse", "MovementWarehouse"],

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.VLADIMIR_BASE_URL,

    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");

      headers.set("Authorization", `Bearer ${token}`);
      headers.set("Accept", `application/json`);

      return headers;
    },
  }),

  endpoints: (builder) => ({
    getWarehouseApi: builder.query({
      query: (params) =>
        `warehouse?search=${params.search}&page=${params.page}&per_page=${params.per_page}&status=${params.status}`,
      providesTags: ["Warehouse"],
    }),

    getWarehouseAllApi: builder.query({
      query: (params) => `warehouse?pagination=none&status=active&user_tagging=${params}`,
      providesTags: ["Warehouse"],
    }),

    getWarehouseIdApi: builder.query({
      query: (id) => `setup/getById/${id}`,
    }),

    postWarehouseStatusApi: builder.mutation({
      query: ({ id, status }) => ({
        url: `/warehouse/archived-warehouse/${id}`,
        method: "PATCH",
        body: {
          status: status,
        },
      }),
      invalidatesTags: ["Warehouse"],
    }),

    postWarehouseApi: builder.mutation({
      query: (data) => ({
        url: `/warehouse`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Warehouse"],
    }),

    updateWarehouseApi: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/warehouse/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Warehouse"],
    }),

    putWarehouseLocationTaggingApi: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/warehouse/location-tagging/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Warehouse"],
    }),

    putWarehouseOneChargingTaggingApi: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/warehouse/one-charging-tagging/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Warehouse"],
    }),

    //Movement Warehouse Endpoint
    getMovementWarehouseApi: builder.query({
      query: (params) => ({ url: `/movement-warehouse`, params }),
      providesTags: ["MovementWarehouse"],
    }),

    getMovementWarehouseByIdApi: builder.query({
      query: ({ id }) => ({ url: `/movement-warehouse/${id}` }),
      providesTags: ["MovementWarehouse"],
    }),

    putUpdateMovementWarehouseApi: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/movement-warehouse/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["MovementWarehouse"],
    }),

    postMovementWarehouseApi: builder.mutation({
      query: (data) => ({
        url: `/movement-warehouse`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["MovementWarehouse"],
    }),

    patchMovementWarehouseApi: builder.mutation({
      query: ({ id, status }) => ({
        url: `/archive-movement-warehouse/${id}`,
        method: "PATCH",
        body: {
          status: status,
        },
      }),
      invalidatesTags: ["MovementWarehouse"],
    }),
  }),
});

export const {
  useGetWarehouseApiQuery,
  useGetWarehouseAllApiQuery,
  useLazyGetWarehouseAllApiQuery,
  useGetWarehouseIdApiQuery,
  usePostWarehouseStatusApiMutation,
  usePostWarehouseApiMutation,
  useUpdateWarehouseApiMutation,
  usePutWarehouseLocationTaggingApiMutation,
  usePutWarehouseOneChargingTaggingApiMutation,

  //Movement Warehouse Hooks
  useGetMovementWarehouseApiQuery,
  useLazyGetMovementWarehouseApiQuery,
  useGetMovementWarehouseByIdApiQuery,
  usePutUpdateMovementWarehouseApiMutation,
  usePostMovementWarehouseApiMutation,
  usePatchMovementWarehouseApiMutation,
} = warehouseApi;
