import { ndcToCanvas, projectPoint, transformPoint } from './math/vec';
import type { Vec3, Object3D, Mat4 } from './types';

const POINT_DIAMETER = 6;

export function clearCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, fillColor: string): void {
  ctx.fillStyle = fillColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function drawPoint(ctx: CanvasRenderingContext2D, point: Vec3, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(point[0] - (POINT_DIAMETER / 2), point[1] - (POINT_DIAMETER / 2), POINT_DIAMETER, POINT_DIAMETER);
}

export function depthToAlpha(z: number): number {
  const nearZ = 5;
  const farZ = 150;
  const t = Math.max(0, Math.min(1, (z - nearZ) / (farZ - nearZ)));
  return 1 - t; // 1 near, 0 far
}

export function drawLine(ctx: CanvasRenderingContext2D, p1: Vec3, p2: Vec3): void {
  const z = (p1[2] + p2[2]) / 2;

  const nearZ = 5;    // distance where width is max
  const farZ = 50;    // ''       ''    ''    '' min
  const maxW = 6;
  const minW = 0.5;

  // Normalize
  const tRaw = (z - nearZ) / (farZ - nearZ);
  // Clamp
  const t = Math.max(0, Math.min(1, tRaw));

  // Linear interpol
  ctx.lineWidth = maxW + (minW - maxW) * t;

  const a = depthToAlpha(z);
  ctx.strokeStyle = `rgba(60, 255, 0, ${0.15 + 0.85 * a})`;

  ctx.beginPath();
  ctx.moveTo(p1[0], p1[1]);
  ctx.lineTo(p2[0], p2[1]);
  ctx.stroke();
}

export function drawModelLine(ctx: CanvasRenderingContext2D, modelVertices: (Vec3 | null)[], lineIndices: number[]): void {
  for (let i = 0; i < lineIndices.length - 1; i++) {
    var p1 = modelVertices[lineIndices[i]];
    var p2 = modelVertices[lineIndices[i + 1]];

    if (!p1 || !p2) continue;

    drawLine(ctx, p1, p2);
  }
}

export function drawModelFace(ctx: CanvasRenderingContext2D, modelVertices: (Vec3 | null)[], faceIndices: number[]): void {
  for (let i = 0; i < faceIndices.length; i++) {
    const p1 = modelVertices[faceIndices[i]];
    const p2 = modelVertices[faceIndices[(i + 1) % faceIndices.length]];

    if (!p1 || !p2) continue;

    drawLine(ctx, p1, p2);
  }
}
function transformProjectToCanvas(
  canvas: HTMLCanvasElement,
  translationMat: Mat4,
  rotationMat: Mat4,
  v: Vec3
): Vec3 | null {
  const world = transformPoint(translationMat, transformPoint(rotationMat, v));
  const ndc = projectPoint(world);
  if (!ndc) return null;
  return ndcToCanvas(canvas, ndc);
}

export function drawModel(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, object: Object3D): void {
  const worldVertices = object.vertices.map((v: Vec3) => transformProjectToCanvas(canvas, object.translation, object.rotation, v));

  for (let line of object.lines) {
    drawModelLine(ctx, worldVertices, line);
  }

  for (let face of object.faces) {
    drawModelFace(ctx, worldVertices, face);
  }
}
