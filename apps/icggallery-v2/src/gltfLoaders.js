// Loader phụ trợ cho model đã nén qua scripts/compress-models.mjs (Draco + KTX2).
// drei's useGLTF tự lo Draco (tham số thứ 2), nhưng KHÔNG tự lo KTX2 — phải tự
// đăng ký KTX2Loader qua `extendLoader` (tham số thứ 4). KTX2Loader cần
// `detectSupport(gl)` để biết GPU hỗ trợ định dạng nào, nên chỉ gọi được BÊN
// TRONG component có `gl` từ useThree() — không dùng được ở `useGLTF.preload`
// gọi ở module scope (không có renderer lúc đó).
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

let ktx2Loader = null;

/** Truyền làm tham số thứ 4 cho useGLTF: `useGLTF(url, true, true, ktx2Extend(gl))`. */
export const ktx2Extend = gl => loader => {
  if (!ktx2Loader) {
    ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath('/basis/');
  }
  ktx2Loader.detectSupport(gl);
  loader.setKTX2Loader(ktx2Loader);
};
