export const getCloudinaryImageId = (url) => {
  return url.split("/").pop().split(".")[0];
};
