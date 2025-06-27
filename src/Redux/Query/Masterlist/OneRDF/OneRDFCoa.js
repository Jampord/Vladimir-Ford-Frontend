import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const oneRDFCoaApi = createApi({
  reducerPath: "OneRDFCoaApi",
  tagTypes: ["OneRDFCoa"],

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.ONE_RDF_BASE_URL,

    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");

      headers.set("Authorization", `Bearer ${token}`);
      headers.set("Accept", `application/json`);
      headers.set("API_KEY", `hello world!`);

      return headers;
    },
  }),

  endpoints: (builder) => ({
    getCompanyOneRDFAllApi: builder.query({
      query: () => `/companies_api?pagination=none&status=active`,
      providesTags: ["OneRDFCoa"],
    }),

    getBusinessUnitOneRDFAllApi: builder.query({
      query: () => `/business_unit_api?pagination=none&status=active`,
      providesTags: ["OneRDFCoa"],
    }),

    getDepartmentOneRDFAllApi: builder.query({
      query: () => `/departments_api?pagination=none&status=active`,
      providesTags: ["OneRDFCoa"],
    }),

    getUnitOneRDFAllApi: builder.query({
      query: () => `/department_unit_api?pagination=none&status=active`,
      providesTags: ["OneRDFCoa"],
    }),

    getSubunitOneRDFAllApi: builder.query({
      query: () => `/sub_unit_api?pagination=none&status=active`,
      providesTags: ["OneRDFCoa"],
    }),

    getLocationOneRDFAllApi: builder.query({
      query: () => `/location_api?pagination=none&status=active`,
      providesTags: ["OneRDFCoa"],
    }),
  }),
});

export const {
  useGetCompanyOneRDFAllApiQuery,
  useLazyGetCompanyOneRDFAllApiQuery,
  useLazyGetBusinessUnitOneRDFAllApiQuery,
  useLazyGetDepartmentOneRDFAllApiQuery,
  useLazyGetUnitOneRDFAllApiQuery,
  useLazyGetSubunitOneRDFAllApiQuery,
  useLazyGetLocationOneRDFAllApiQuery,
} = oneRDFCoaApi;
