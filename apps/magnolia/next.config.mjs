/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /*
   * Static export. Every route on this page is prerendered and there is no server code, so the
   * build is plain files and can be served straight from Cloudflare's asset store.
   *
   * `unoptimized` is not a compromise here: the images in public/ were already re-encoded to
   * WebP at the exact widths they are displayed at, so Next's optimizer was only adding a
   * second lossy pass on top of the first. Turning it off removes that.
   */
  output: "export",
  images: { unoptimized: true },
};
export default nextConfig;
