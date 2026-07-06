export function optimizeCloudinary(url, width) {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  var parts = url.split("/upload/");
  if (parts.length !== 2) return url;
  return parts[0] + "/upload/w_" + (width || 400) + ",c_fill,f_auto/" + parts[1];
}
