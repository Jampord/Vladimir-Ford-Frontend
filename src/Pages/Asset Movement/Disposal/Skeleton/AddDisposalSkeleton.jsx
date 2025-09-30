import { Box, Skeleton, Stack } from "@mui/material";

const AddDisposalSkeleton = () => {
  return (
    <Stack>
      <Stack direction="column" spacing={1} mt={1}>
        <Skeleton variant="rounded" width={240} height={30} />
        <Skeleton variant="rounded" width={240} height={30} />
        <Skeleton variant="rounded" width={240} height={30} />
        <Skeleton variant="rounded" width={240} height={30} />
        <Stack gap={0.2} mt={1}>
          <Skeleton variant="text" width={200} height={10} />
          <Skeleton variant="text" width={200} height={10} />
          <Skeleton variant="text" width={200} height={10} />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default AddDisposalSkeleton;
