import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

type Phase = 'setup' | 'play';

// 사다리 한 줄(row)에 대한 가로다리 정보. h[i] === true 이면 i번 세로줄과 i+1번 세로줄이 연결됨.
type Rung = boolean[];

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;
const ROWS = 10; // 가로다리가 놓일 수 있는 행의 개수

// 한 칸의 픽셀 크기
const COL_GAP = 90;
const ROW_GAP = 44;
const PADDING_X = 50;
const PADDING_TOP = 24;
const PADDING_BOTTOM = 24;

const PALETTE = [
  '#C75B6B',
  '#9C6BB0',
  '#5B8BC7',
  '#5BB39A',
  '#C7A35B',
  '#C76B9C',
  '#6BC78B',
  '#B06B5B',
];

function randomLadder(cols: number): Rung[] {
  const rungs: Rung[] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: Rung = new Array(Math.max(cols - 1, 0)).fill(false);
    for (let c = 0; c < cols - 1; c++) {
      // 인접한 가로다리가 겹치지 않도록 (바로 왼쪽이 비어있을 때만 후보)
      if (row[c - 1]) continue;
      if (Math.random() < 0.4) row[c] = true;
    }
    rungs.push(row);
  }
  return rungs;
}

// start 세로줄에서 출발했을 때 사다리를 타고 내려가 도착하는 세로줄 index
function traceColumn(rungs: Rung[], start: number): number {
  let col = start;
  for (let r = 0; r < rungs.length; r++) {
    if (col > 0 && rungs[r][col - 1]) col -= 1;
    else if (rungs[r][col] && col < rungs[r].length) col += 1;
  }
  return col;
}

// start 세로줄에서 출발한 경로의 좌표 점들을 만든다 (애니메이션용)
function tracePath(rungs: Rung[], start: number): {x: number; y: number}[] {
  const colX = (c: number) => PADDING_X + c * COL_GAP;
  const rowY = (r: number) => PADDING_TOP + r * ROW_GAP;
  const points: {x: number; y: number}[] = [];
  let col = start;
  points.push({x: colX(col), y: 0}); // 맨 위
  points.push({x: colX(col), y: rowY(0)});
  for (let r = 0; r < rungs.length; r++) {
    if (col > 0 && rungs[r][col - 1]) {
      points.push({x: colX(col), y: rowY(r)});
      col -= 1;
      points.push({x: colX(col), y: rowY(r)});
    } else if (rungs[r][col] && col < rungs[r].length) {
      points.push({x: colX(col), y: rowY(r)});
      col += 1;
      points.push({x: colX(col), y: rowY(r)});
    }
  }
  const bottomY = PADDING_TOP + (ROWS - 1) * ROW_GAP + PADDING_BOTTOM;
  points.push({x: colX(col), y: bottomY});
  return points;
}

export default function App() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [count, setCount] = useState(4);
  const [names, setNames] = useState<string[]>(['', '', '', '']);
  const [results, setResults] = useState<string[]>(['꽝', '당첨', '꽝', '꽝']);

  const [rungs, setRungs] = useState<Rung[]>([]);
  const [activeStart, setActiveStart] = useState<number | null>(null);
  const [revealedEnds, setRevealedEnds] = useState<Set<number>>(new Set());

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  // 인원수 변경 시 이름/결과 배열 크기 맞추기
  const setPlayerCount = (n: number) => {
    const clamped = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, n));
    setCount(clamped);
    setNames((prev) => {
      const next = prev.slice(0, clamped);
      while (next.length < clamped) next.push('');
      return next;
    });
    setResults((prev) => {
      const next = prev.slice(0, clamped);
      while (next.length < clamped) next.push('');
      return next;
    });
  };

  const start = () => {
    setRungs(randomLadder(count));
    setRevealedEnds(new Set());
    setActiveStart(null);
    setPhase('play');
  };

  const reshuffle = () => {
    setRungs(randomLadder(count));
    setRevealedEnds(new Set());
    setActiveStart(null);
  };

  const width = useMemo(() => PADDING_X * 2 + (count - 1) * COL_GAP, [count]);
  const height =
    PADDING_TOP + (ROWS - 1) * ROW_GAP + PADDING_BOTTOM + PADDING_TOP;

  // 사다리 + 애니메이션 그리기
  const draw = useCallback(
    (progress: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const colX = (c: number) => PADDING_X + c * COL_GAP;
      const topY = PADDING_TOP;
      const bottomY = PADDING_TOP + (ROWS - 1) * ROW_GAP + PADDING_BOTTOM;

      // 세로줄
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#E8B7BD';
      for (let c = 0; c < count; c++) {
        ctx.beginPath();
        ctx.moveTo(colX(c), topY);
        ctx.lineTo(colX(c), bottomY);
        ctx.stroke();
      }

      // 가로다리
      ctx.strokeStyle = '#D98A95';
      for (let r = 0; r < rungs.length; r++) {
        for (let c = 0; c < rungs[r].length; c++) {
          if (!rungs[r][c]) continue;
          const y = PADDING_TOP + r * ROW_GAP;
          ctx.beginPath();
          ctx.moveTo(colX(c), y);
          ctx.lineTo(colX(c + 1), y);
          ctx.stroke();
        }
      }

      // 활성 경로
      if (activeStart !== null) {
        const points = tracePath(rungs, activeStart);
        // 전체 길이 계산
        let total = 0;
        const segLen: number[] = [];
        for (let i = 1; i < points.length; i++) {
          const d = Math.hypot(
            points[i].x - points[i - 1].x,
            points[i].y - points[i - 1].y,
          );
          segLen.push(d);
          total += d;
        }
        const target = total * progress;

        ctx.strokeStyle = PALETTE[activeStart % PALETTE.length];
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        let acc = 0;
        let head = points[0];
        for (let i = 1; i < points.length; i++) {
          const seg = segLen[i - 1];
          if (acc + seg <= target) {
            ctx.lineTo(points[i].x, points[i].y);
            acc += seg;
            head = points[i];
          } else {
            const remain = target - acc;
            const t = seg === 0 ? 0 : remain / seg;
            const hx = points[i - 1].x + (points[i].x - points[i - 1].x) * t;
            const hy = points[i - 1].y + (points[i].y - points[i - 1].y) * t;
            ctx.lineTo(hx, hy);
            head = {x: hx, y: hy};
            break;
          }
        }
        ctx.stroke();

        // 진행 머리 표시
        ctx.fillStyle = PALETTE[activeStart % PALETTE.length];
        ctx.beginPath();
        ctx.arc(head.x, head.y, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [width, height, count, rungs, activeStart],
  );

  // activeStart 변경 시 애니메이션 실행
  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (activeStart === null) {
      draw(0);
      return;
    }
    const duration = 1400;
    let startTime: number | null = null;
    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const p = Math.min(1, elapsed / duration);
      draw(p);
      if (p < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        const end = traceColumn(rungs, activeStart);
        setRevealedEnds((prev) => new Set(prev).add(end));
      }
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStart, rungs]);

  // 정적 다시그리기 (사다리/인원 변경)
  useEffect(() => {
    if (activeStart === null) draw(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rungs, count]);

  const playerLabel = (i: number) =>
    names[i]?.trim() ? names[i] : `참가자 ${i + 1}`;

  const resultLabel = (i: number) =>
    results[i]?.trim() ? results[i] : `결과 ${i + 1}`;

  const gapStyle = {
    gap: COL_GAP - 64,
    paddingLeft: PADDING_X - 32,
    paddingRight: PADDING_X - 32,
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center px-4 py-8"
      style={{
        background:
          'linear-gradient(160deg, #F6D5D8 0%, #EFC0C6 45%, #E6A9B2 100%)',
      }}>
      <header className="text-center mb-6">
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight"
          style={{color: '#8A4750'}}>
          🪜 사다리타기
        </h1>
        <p className="mt-2 text-sm" style={{color: '#9B5A63'}}>
          인디안 핑크빛 사다리에서 운을 시험해 보세요
        </p>
      </header>

      {phase === 'setup' ? (
        <div
          className="w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-lg"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.55)',
            border: '1px solid rgba(255,255,255,0.6)',
            backdropFilter: 'blur(4px)',
          }}>
          <label
            className="block text-sm font-semibold mb-2"
            style={{color: '#8A4750'}}>
            참가 인원: {count}명
          </label>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setPlayerCount(count - 1)}
              className="w-10 h-10 rounded-full text-xl font-bold text-white transition active:scale-95"
              style={{backgroundColor: '#D98A95'}}>
              −
            </button>
            <input
              type="range"
              min={MIN_PLAYERS}
              max={MAX_PLAYERS}
              value={count}
              onChange={(e) => setPlayerCount(Number(e.target.value))}
              className="flex-1 accent-[#C75B6B]"
            />
            <button
              onClick={() => setPlayerCount(count + 1)}
              className="w-10 h-10 rounded-full text-xl font-bold text-white transition active:scale-95"
              style={{backgroundColor: '#D98A95'}}>
              +
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2
                className="text-sm font-semibold mb-2"
                style={{color: '#8A4750'}}>
                참가자 이름
              </h2>
              <div className="space-y-2">
                {names.map((n, i) => (
                  <input
                    key={i}
                    value={n}
                    onChange={(e) =>
                      setNames((prev) => {
                        const next = [...prev];
                        next[i] = e.target.value;
                        return next;
                      })
                    }
                    placeholder={`참가자 ${i + 1}`}
                    className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.85)',
                      border: '1px solid #E8B7BD',
                      color: '#5A3338',
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <h2
                className="text-sm font-semibold mb-2"
                style={{color: '#8A4750'}}>
                결과 (도착지)
              </h2>
              <div className="space-y-2">
                {results.map((rsl, i) => (
                  <input
                    key={i}
                    value={rsl}
                    onChange={(e) =>
                      setResults((prev) => {
                        const next = [...prev];
                        next[i] = e.target.value;
                        return next;
                      })
                    }
                    placeholder={`결과 ${i + 1}`}
                    className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.85)',
                      border: '1px solid #E8B7BD',
                      color: '#5A3338',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={start}
            className="mt-7 w-full py-3 rounded-2xl text-white font-bold text-lg shadow-md transition active:scale-[0.98]"
            style={{backgroundColor: '#C75B6B'}}>
            사다리 시작하기
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          {/* 참가자 버튼 */}
          <div className="flex justify-center" style={gapStyle}>
            {Array.from({length: count}).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveStart(i)}
                className="w-16 text-center text-xs sm:text-sm font-bold rounded-xl py-2 transition active:scale-95 truncate"
                style={{
                  backgroundColor:
                    activeStart === i
                      ? PALETTE[i % PALETTE.length]
                      : 'rgba(255,255,255,0.8)',
                  color: activeStart === i ? '#fff' : '#8A4750',
                  border: `2px solid ${PALETTE[i % PALETTE.length]}`,
                }}>
                {playerLabel(i)}
              </button>
            ))}
          </div>

          {/* 사다리 캔버스 */}
          <div className="my-2 overflow-x-auto max-w-full">
            <canvas ref={canvasRef} />
          </div>

          {/* 결과 칸 */}
          <div className="flex justify-center" style={gapStyle}>
            {Array.from({length: count}).map((_, i) => {
              const revealed = revealedEnds.has(i);
              return (
                <div
                  key={i}
                  className="w-16 text-center text-xs sm:text-sm font-bold rounded-xl py-2 truncate"
                  style={{
                    backgroundColor: revealed
                      ? '#C75B6B'
                      : 'rgba(255,255,255,0.8)',
                    color: revealed ? '#fff' : '#8A4750',
                    border: '2px solid #D98A95',
                  }}>
                  {revealed ? resultLabel(i) : '?'}
                </div>
              );
            })}
          </div>

          {/* 활성 결과 안내 */}
          {activeStart !== null && (
            <div
              className="mt-5 px-5 py-3 rounded-2xl text-center font-semibold shadow"
              style={{
                backgroundColor: 'rgba(255,255,255,0.75)',
                color: '#8A4750',
              }}>
              {playerLabel(activeStart)} →{' '}
              <span style={{color: '#C75B6B'}}>
                {resultLabel(traceColumn(rungs, activeStart))}
              </span>
            </div>
          )}

          {/* 컨트롤 */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={reshuffle}
              className="px-5 py-2.5 rounded-2xl text-white font-bold shadow transition active:scale-95"
              style={{backgroundColor: '#D98A95'}}>
              사다리 다시 섞기
            </button>
            <button
              onClick={() => {
                setRevealedEnds(
                  new Set(Array.from({length: count}, (_, i) => i)),
                );
                setActiveStart(null);
              }}
              className="px-5 py-2.5 rounded-2xl text-white font-bold shadow transition active:scale-95"
              style={{backgroundColor: '#C75B6B'}}>
              전체 결과 공개
            </button>
            <button
              onClick={() => setPhase('setup')}
              className="px-5 py-2.5 rounded-2xl font-bold shadow transition active:scale-95"
              style={{
                backgroundColor: 'rgba(255,255,255,0.85)',
                color: '#8A4750',
                border: '2px solid #D98A95',
              }}>
              설정으로
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
