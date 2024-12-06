import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const elixirApi = createApi({
  reducerPath: "elixirApi",
  tagTypes: ["Elixir"],

  baseQuery: fetchBaseQuery({
    // baseUrl: "http://elixir:72/api/", //Production url
    baseUrl: "https://pretest-api.elixir-etd.rdfmis.com/api",

    prepareHeaders: (headers) => {
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJuYW1lIjoiY3Jhc2NvIiwibmJmIjoxNzI0MjEyMjU0LCJleHAiOjE3MjQyOTg2NTQsImlhdCI6MTcyNDIxMjI1NH0.1bKSk9XUTOqHjzm2jEidGmbwXXSrPk6ZDwXY3C4zqRw";

      headers.set("Authorization", `Bearer ${token}`);
      headers.set("Accept", `application/json`);

      return headers;
    },
  }),

  endpoints: (builder) => ({
    getElixirApi: builder.query({
      query: () => `Ordering/MoveOrderAssetTag`,
      providesTags: ["Elixir"],
    }),

    putElixirAssetTag: builder.mutation({
      query: (data) => ({
        url: `/Ordering/IsAssetTag`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Elixir"],
    }),
  }),
});

export const { useGetElixirApiQuery, usePutElixirAssetTagMutation } = elixirApi;
