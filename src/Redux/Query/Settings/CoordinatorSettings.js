import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const coordinatorSettingsApi = createApi({
  reducerPath: "coordinatorSettingsApi",
  tagTypes: ["CoordinatorSettings"],

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
    getCoordinatorSettingsApi: builder.query({
      query: (params) =>
        `/coordinator-handles?pagination=none&per_page=${params.per_page}&page=${params.page}&status=${params.status}&search=${params.search}`,
      providesTags: ["CoordinatorSettings"],
    }),

    getAllCoordinatorSettingsApi: builder.query({
      query: () => `/coordinator-handles?pagination=none`,
      providesTags: ["CoordinatorSettings"],
    }),

    getSingleCoordinatorSettingApi: builder.query({
      query: (params) => `/coordinator-handles/${params.id}`,
      providesTags: ["CoordinatorSettings"],
    }),

    postCoordinatorSettingsApi: builder.mutation({
      query: (data) => ({
        url: `coordinator-handles`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CoordinatorSettings"],
    }),

    updateCoordinatorSettingsApi: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/coordinator-handles/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CoordinatorSettings"],
    }),

    patchArchiveCoordinatorSettingsApi: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/archived-coordinator-handles/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["CoordinatorSettings"],
    }),
  }),
});

export const {
  useGetCoordinatorSettingsApiQuery,
  useGetAllCoordinatorSettingsApiQuery,
  useLazyGetSingleCoordinatorSettingApiQuery,
  usePostCoordinatorSettingsApiMutation,
  useUpdateCoordinatorSettingsApiMutation,
  usePatchArchiveCoordinatorSettingsApiMutation,
} = coordinatorSettingsApi;
