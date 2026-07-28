// Lighting Editor — bật bằng query ?light trên URL.
// Designer chỉnh sáng POV ngay trên UI (exposure, ambient, environment IBL, đèn
// key) → scene đổi tức thì. "Copy JSON" → gửi dev bake vào floors.js (cfg.lighting).
// Giá trị lưu localStorage theo floor; mặc định khớp look hiện tại nên không đổi
// gì cho tới khi designer sửa.
import { useEffect, useState } from 'react';

// drei <Environment preset> hợp lệ — ảnh hưởng phản chiếu + fill gián tiếp.
export const ENV_PRESETS = [
  'apartment',
  'city',
  'dawn',
  'forest',
  'lobby',
  'night',
  'park',
  'studio',
  'sunset',
  'warehouse',
];

// Mặc định = đúng giá trị đang hardcode trong Experience.jsx (keyOn=false → POV
// hiện chưa có đèn directional, giữ nguyên).
export const LIGHT_DEFAULTS = {
  exposure: 0.95, // toneMappingExposure — độ sáng tổng thể
  ambient: 0.25, // ambientLight intensity
  ambientColor: '#ffffff',
  envPreset: 'apartment',
  envIntensity: 0.55, // Environment environmentIntensity (IBL)
  keyOn: false, // đèn key directional cho POV (tạo khối/đổ bóng nhẹ)
  keyIntensity: 1.2,
  keyColor: '#fff5e6',
  keyAzimuth: 45, // độ, hướng quay quanh trục Y
  keyElevation: 50, // độ, cao so với mặt phẳng ngang
};

const storeKey = floor => `lightdraft:${floor}`;

// Mặc định hiệu dụng = built-in + lighting bake sẵn của floor (floors.js).
export function defaultsFor(floorLighting) {
  return { ...LIGHT_DEFAULTS, ...(floorLighting || {}) };
}

// Luôn bật: đọc mặc định, đè bằng draft localStorage nếu designer đã lưu.
export function useLightSettings(floor, floorLighting) {
  const [light, setLight] = useState(() => defaultsFor(floorLighting));
  useEffect(() => {
    let base = defaultsFor(floorLighting);
    try {
      const saved = localStorage.getItem(storeKey(floor));
      if (saved) base = { ...base, ...JSON.parse(saved) };
    } catch {
      /* hỏng thì dùng mặc định */
    }
    setLight(base);
  }, [floor, floorLighting]);
  return [light, setLight];
}

const persist = (floor, light) => {
  try {
    localStorage.setItem(storeKey(floor), JSON.stringify(light));
  } catch {
    /* quota */
  }
};

function Slider({ label, value, min, max, step, unit, onChange }) {
  return (
    <label className='block'>
      <div className='mb-0.5 flex items-center justify-between'>
        <span className='opacity-70'>{label}</span>
        <span className='tabular-nums opacity-90'>
          {value}
          {unit || ''}
        </span>
      </div>
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={e => onChange(parseFloat(e.target.value))}
        className='w-full accent-amber-300'
      />
    </label>
  );
}

function Color({ label, value, onChange }) {
  return (
    <label className='flex items-center justify-between'>
      <span className='opacity-70'>{label}</span>
      <input
        type='color'
        value={value}
        aria-label={label}
        onChange={e => onChange(e.target.value)}
        className='h-6 w-10 cursor-pointer rounded bg-transparent'
      />
    </label>
  );
}

export function LightEditorPanel({ floor, light, setLight, floorLighting }) {
  const [copied, setCopied] = useState(false);
  const set = (key, val) =>
    setLight(l => {
      const next = { ...l, [key]: val };
      persist(floor, next);
      return next;
    });
  const reset = () => {
    localStorage.removeItem(storeKey(floor));
    setLight(defaultsFor(floorLighting));
  };
  const copy = () => {
    navigator.clipboard
      .writeText(JSON.stringify({ floor, lighting: light }, null, 2))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
  };

  return (
    <div className='pointer-events-auto fixed top-16 right-4 z-30 max-h-[80vh] w-[264px] space-y-2.5 overflow-y-auto rounded-xl bg-black/75 p-3 font-mono text-[11px] text-white backdrop-blur'>
      <div className='flex items-center justify-between'>
        <span className='text-[10px] tracking-[0.2em] uppercase opacity-70'>
          Ánh sáng · {floor}
        </span>
      </div>

      <Slider
        label='Exposure'
        value={light.exposure}
        min={0.3}
        max={2}
        step={0.01}
        onChange={v => set('exposure', v)}
      />

      <div className='border-t border-white/10 pt-2'>
        <span className='text-[10px] tracking-[0.18em] uppercase opacity-50'>
          Ambient
        </span>
        <div className='mt-1 space-y-1.5'>
          <Slider
            label='Cường độ'
            value={light.ambient}
            min={0}
            max={2}
            step={0.01}
            onChange={v => set('ambient', v)}
          />
          <Color
            label='Màu'
            value={light.ambientColor}
            onChange={v => set('ambientColor', v)}
          />
        </div>
      </div>

      <div className='border-t border-white/10 pt-2'>
        <span className='text-[10px] tracking-[0.18em] uppercase opacity-50'>
          Environment (IBL)
        </span>
        <div className='mt-1 space-y-1.5'>
          <label className='flex items-center justify-between'>
            <span className='opacity-70'>Preset</span>
            <select
              value={light.envPreset}
              aria-label='Environment preset'
              onChange={e => set('envPreset', e.target.value)}
              className='rounded bg-white/10 px-1.5 py-0.5 text-white outline-none focus:bg-white/20'
            >
              {ENV_PRESETS.map(p => (
                <option key={p} value={p} className='text-black'>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <Slider
            label='Cường độ'
            value={light.envIntensity}
            min={0}
            max={2}
            step={0.01}
            onChange={v => set('envIntensity', v)}
          />
        </div>
      </div>

      <div className='border-t border-white/10 pt-2'>
        <label className='flex items-center justify-between'>
          <span className='text-[10px] tracking-[0.18em] uppercase opacity-50'>
            Đèn Key (directional)
          </span>
          <input
            type='checkbox'
            checked={light.keyOn}
            aria-label='Bật đèn key'
            onChange={e => set('keyOn', e.target.checked)}
            className='accent-amber-300'
          />
        </label>
        {light.keyOn && (
          <div className='mt-1 space-y-1.5'>
            <Slider
              label='Cường độ'
              value={light.keyIntensity}
              min={0}
              max={4}
              step={0.05}
              onChange={v => set('keyIntensity', v)}
            />
            <Color
              label='Màu'
              value={light.keyColor}
              onChange={v => set('keyColor', v)}
            />
            <Slider
              label='Hướng (azimuth)'
              value={light.keyAzimuth}
              min={0}
              max={360}
              step={1}
              unit='°'
              onChange={v => set('keyAzimuth', v)}
            />
            <Slider
              label='Cao (elevation)'
              value={light.keyElevation}
              min={5}
              max={89}
              step={1}
              unit='°'
              onChange={v => set('keyElevation', v)}
            />
          </div>
        )}
      </div>

      <div className='flex gap-2 border-t border-white/10 pt-2.5'>
        <button
          type='button'
          onClick={copy}
          className='flex-1 rounded bg-white/15 py-1.5 hover:bg-white/25'
        >
          {copied ? '✓ Đã copy' : 'Copy JSON'}
        </button>
        <button
          type='button'
          onClick={reset}
          className='rounded bg-white/10 px-3 py-1.5 hover:bg-white/20'
        >
          Reset
        </button>
      </div>
      <p className='leading-snug opacity-50'>
        Kéo slider → sáng đổi ngay. Xong bấm Copy JSON gửi dev bake vào{' '}
        <code>cfg.lighting</code> của floor.
      </p>
    </div>
  );
}
