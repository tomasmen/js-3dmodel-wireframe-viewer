import type { Vec3, Mat4 } from "../types.ts";

export function vec3(x = 0, y = 0, z = 0): Vec3 {
  const v = new Float32Array(3);
  v[0] = x;
  v[1] = y;
  v[2] = z;
  return v;
}

export function transformPoint(mat: Mat4, vec: Vec3): Vec3 {
  const nx = mat[0] * vec[0] + mat[1] * vec[1] + mat[2] * vec[2] + mat[3] * 1;
  const ny = mat[4] * vec[0] + mat[5] * vec[1] + mat[6] * vec[2] + mat[7] * 1;
  const nz = mat[8] * vec[0] + mat[9] * vec[1] + mat[10] * vec[2] + mat[11] * 1;
  const w = mat[12] * vec[0] + mat[13] * vec[1] + mat[14] * vec[2] + mat[15] * 1;

  if (w !== 1 && w !== 0) {
    return vec3(nx / w, ny / w, nz / w);
  }
  return vec3(nx, ny, nz);
}

export function projectPoint(point: Vec3): Vec3 | null {
  if (point[2] <= 0.0001) return null;
  return vec3(point[0] / point[2], point[1] / point[2], point[2]);
}

export function ndcToCanvas(canvas: HTMLCanvasElement, point: Vec3 | null): Vec3 | null {
  if (!point) return null;
  return vec3(
    ((point[0] + 1) / 2) * canvas.width,
    ((1 - (point[1] + 1) / 2)) * canvas.height,
    point[2]
  );
}
