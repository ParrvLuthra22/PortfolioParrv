'use client';

import {
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NeuralNode {
  id: string;
  layer: number;      // 0=input, 1=hidden1, 2=hidden2, 3=output
  indexInLayer: number;
  x: number;
  y: number;
  radius: number;
  opacity: number;    // 0–1 for fade state
  scale: number;      // for selected output node
  outputIdx: number | null; // null unless this is layer-3 node
}

export interface NeuralEdge {
  id: string;
  from: NeuralNode;
  to: NeuralNode;
  opacity: number;    // 0–1 draw opacity
  highlighted: boolean;
}

interface Signal {
  id: string;
  edge: NeuralEdge;
  t: number;          // 0→1 progress along the edge
  speed: number;
  color: string;
  opacity: number;
  active: boolean;
}

export interface NeuralNetworkCanvasHandle {
  highlightOutput: (outputIdx: number | null) => void;
  selectOutput: (outputIdx: number | null) => void;
  pauseAmbient: (pause: boolean) => void;
}

// ─── Network topology ─────────────────────────────────────────────────────────

const LAYER_COUNTS = [4, 6, 5, 3];
const NODE_RADIUS = 7;
const MUSTARD = '#D4A030';
const SIGNAL_COLORS = [MUSTARD, '#FFFFFF', '#88CCEE'];

function buildNetwork(width: number, height: number): { nodes: NeuralNode[]; edges: NeuralEdge[] } {
  const nodes: NeuralNode[] = [];
  const layerCount = LAYER_COUNTS.length;
  const paddingX = width * 0.1;
  const usableWidth = width - paddingX * 2;
  const paddingY = height * 0.1;
  const usableHeight = height - paddingY * 2;

  let nodeId = 0;
  let outputNodeIdx = 0;

  for (let layer = 0; layer < layerCount; layer++) {
    const count = LAYER_COUNTS[layer];
    const x = paddingX + (layer / (layerCount - 1)) * usableWidth;

    for (let i = 0; i < count; i++) {
      const y = paddingY + ((i + 0.5) / count) * usableHeight;
      nodes.push({
        id: `n-${nodeId++}`,
        layer,
        indexInLayer: i,
        x,
        y,
        radius: NODE_RADIUS,
        opacity: 1,
        scale: 1,
        outputIdx: layer === layerCount - 1 ? outputNodeIdx++ : null,
      });
    }
  }

  const edges: NeuralEdge[] = [];
  let edgeId = 0;

  // Fully-connect adjacent layers
  for (let layer = 0; layer < layerCount - 1; layer++) {
    const fromNodes = nodes.filter(n => n.layer === layer);
    const toNodes = nodes.filter(n => n.layer === layer + 1);
    for (const from of fromNodes) {
      for (const to of toNodes) {
        edges.push({
          id: `e-${edgeId++}`,
          from,
          to,
          opacity: 0.12,
          highlighted: false,
        });
      }
    }
  }

  return { nodes, edges };
}

// ─── Component ────────────────────────────────────────────────────────────────

const NeuralNetworkCanvas = forwardRef<NeuralNetworkCanvasHandle, {
  className?: string;
}>(function NeuralNetworkCanvas({ className }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<NeuralNode[]>([]);
  const edgesRef = useRef<NeuralEdge[]>([]);
  const signalsRef = useRef<Signal[]>([]);
  const rafRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const selectedOutputRef = useRef<number | null>(null);
  const highlightedOutputRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sigId = useRef(0);

  // ── Build & draw ──────────────────────────────────────────────────────────

  const buildAndDraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    const { nodes, edges } = buildNetwork(width, height);
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, []);

  // ── Draw frame ────────────────────────────────────────────────────────────

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = devicePixelRatio;
    const W = canvas.width;
    const H = canvas.height;
    const scale = dpr;

    ctx.clearRect(0, 0, W, H);

    // Draw edges
    for (const edge of edgesRef.current) {
      const alpha = edge.opacity;
      if (alpha < 0.005) continue;
      ctx.beginPath();
      ctx.moveTo(edge.from.x * scale, edge.from.y * scale);
      ctx.lineTo(edge.to.x * scale, edge.to.y * scale);
      ctx.strokeStyle = edge.highlighted
        ? `rgba(212,160,48,${alpha})`
        : `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = edge.highlighted ? 1.5 : 0.8;
      ctx.stroke();
    }

    // Draw signals (traveling dots)
    for (const sig of signalsRef.current) {
      if (!sig.active) continue;
      const x = (sig.edge.from.x + (sig.edge.to.x - sig.edge.from.x) * sig.t) * scale;
      const y = (sig.edge.from.y + (sig.edge.to.y - sig.edge.from.y) * sig.t) * scale;

      // Glow
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 10 * scale);
      grad.addColorStop(0, sig.color + 'CC');
      grad.addColorStop(1, sig.color + '00');
      ctx.beginPath();
      ctx.arc(x, y, 10 * scale, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.globalAlpha = sig.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Core dot
      ctx.beginPath();
      ctx.arc(x, y, 3.5 * scale, 0, Math.PI * 2);
      ctx.fillStyle = sig.color;
      ctx.globalAlpha = sig.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Draw nodes
    for (const node of nodesRef.current) {
      const nx = node.x * scale;
      const ny = node.y * scale;
      const r = node.radius * node.scale * scale;
      const alpha = node.opacity;

      // Glow
      const isOutput = node.layer === 3;
      const glowColor = isOutput ? MUSTARD : '#FFFFFF';
      const glowR = r * 3;
      const gGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, glowR);
      gGrad.addColorStop(0, glowColor + '4D'); // 30% opacity
      gGrad.addColorStop(1, glowColor + '00');
      ctx.beginPath();
      ctx.arc(nx, ny, glowR, 0, Math.PI * 2);
      ctx.fillStyle = gGrad;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Node fill
      ctx.beginPath();
      ctx.arc(nx, ny, r, 0, Math.PI * 2);
      ctx.fillStyle = isOutput ? MUSTARD + '33' : 'rgba(255,255,255,0.08)';
      ctx.globalAlpha = alpha;
      ctx.fill();

      // Node border
      ctx.strokeStyle = isOutput ? MUSTARD : 'rgba(255,255,255,0.5)';
      ctx.lineWidth = isOutput ? 1.5 : 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }, []);

  // ── Animation loop ────────────────────────────────────────────────────────

  const loop = useCallback(() => {
    if (!pausedRef.current) {
      // Advance signals
      for (const sig of signalsRef.current) {
        if (sig.active) {
          sig.t = Math.min(1, sig.t + sig.speed);
          if (sig.t >= 1) sig.active = false;
        }
      }
      // Clean finished signals
      signalsRef.current = signalsRef.current.filter(s => s.active);
    }

    drawFrame();
    rafRef.current = requestAnimationFrame(loop);
  }, [drawFrame]);

  // ── Spawn signal chain ────────────────────────────────────────────────────

  const spawnSignalChain = useCallback(() => {
    if (pausedRef.current) return;
    const edges = edgesRef.current;
    if (!edges.length) return;

    const color = SIGNAL_COLORS[Math.floor(Math.random() * SIGNAL_COLORS.length)];
    // Pick a random input node
    const inputNodes = nodesRef.current.filter(n => n.layer === 0);
    const startNode = inputNodes[Math.floor(Math.random() * inputNodes.length)];

    // Traverse layer by layer
    let currentNode = startNode;
    let delay = 0;

    for (let layer = 0; layer < 3; layer++) {
      const layerEdges = edges.filter(e => e.from === currentNode);
      if (!layerEdges.length) break;
      const chosenEdge = layerEdges[Math.floor(Math.random() * layerEdges.length)];
      const capturedEdge = chosenEdge;
      const capturedDelay = delay;

      setTimeout(() => {
        if (pausedRef.current) return;
        signalsRef.current.push({
          id: `sig-${++sigId.current}`,
          edge: capturedEdge,
          t: 0,
          speed: 0.018 + Math.random() * 0.008,
          color,
          opacity: 0.85,
          active: true,
        });
      }, capturedDelay);

      currentNode = chosenEdge.to;
      delay += 280 + Math.random() * 120;
    }
  }, []);

  // ── Expose imperative API ─────────────────────────────────────────────────

  const applyHighlight = useCallback((outputIdx: number | null, dimOthers: boolean) => {
    const nodes = nodesRef.current;
    const edges = edgesRef.current;

    if (outputIdx === null) {
      // Reset everything
      for (const n of nodes) { n.opacity = 1; n.scale = 1; }
      for (const e of edges) { e.opacity = 0.12; e.highlighted = false; }
      return;
    }

    // Find the output node
    const outputNode = nodes.find(n => n.outputIdx === outputIdx);
    if (!outputNode) return;

    // Find all edges feeding into this output node (backtrack full path)
    const feedingEdgeIds = new Set<string>();
    const feedingNodeIds = new Set<string>();

    const backtrack = (node: NeuralNode) => {
      feedingNodeIds.add(node.id);
      const incoming = edges.filter(e => e.to === node);
      for (const edge of incoming) {
        feedingEdgeIds.add(edge.id);
        backtrack(edge.from);
      }
    };
    backtrack(outputNode);

    for (const n of nodes) {
      if (feedingNodeIds.has(n.id)) {
        n.opacity = 1;
        n.scale = n === outputNode ? 1.3 : 1;
      } else {
        n.opacity = dimOthers ? 0.05 : 0.3;
        n.scale = 1;
      }
    }

    for (const e of edges) {
      if (feedingEdgeIds.has(e.id)) {
        e.opacity = 0.8;
        e.highlighted = true;
      } else {
        e.opacity = dimOthers ? 0.02 : 0.04;
        e.highlighted = false;
      }
    }
  }, []);

  useImperativeHandle(ref, () => ({
    highlightOutput(outputIdx: number | null) {
      highlightedOutputRef.current = outputIdx;
      // Only apply if nothing is selected
      if (selectedOutputRef.current === null) {
        applyHighlight(outputIdx, false);
      }
    },
    selectOutput(outputIdx: number | null) {
      selectedOutputRef.current = outputIdx;
      highlightedOutputRef.current = null;
      applyHighlight(outputIdx, true);
    },
    pauseAmbient(pause: boolean) {
      pausedRef.current = pause;
    },
  }), [applyHighlight]);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  useEffect(() => {
    buildAndDraw();
    rafRef.current = requestAnimationFrame(loop);
    spawnTimerRef.current = setInterval(spawnSignalChain, 2000);

    const observer = new ResizeObserver(() => {
      buildAndDraw();
    });
    if (canvasRef.current) observer.observe(canvasRef.current);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      observer.disconnect();
    };
  }, [buildAndDraw, loop, spawnSignalChain]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', background: 'transparent' }}
      aria-label="Decorative animated neural network visualization showing nodes and signal propagation"
      role="img"
    />
  );
});

export default NeuralNetworkCanvas;
