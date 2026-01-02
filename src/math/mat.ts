import type { Mat4, Vec3 } from '../types.ts';

export function mat4Identity(): Mat4 {
  const m = new Float32Array(16);
  m[0] = 1;
  m[5] = 1;
  m[10] = 1;
  m[15] = 1;
  return m;
}

export function copyMat(mat: Mat4): Mat4 {
  const out = new Float32Array(16);

  for (let i = 0; i < 16; i++) {
    out[i] = mat[i];
  }

  return out;
}

export function matMult(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);

  out[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
  out[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
  out[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
  out[3] = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];

  out[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
  out[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
  out[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
  out[7] = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];

  out[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
  out[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
  out[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
  out[11] = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];

  out[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
  out[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
  out[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
  out[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];

  return out;
}

export function rotateX(mat: Mat4, angle: number): Mat4 {
  const rotationMatrix = mat4Identity();

  rotationMatrix[5] = Math.cos(angle);
  rotationMatrix[6] = -1 * Math.sin(angle);
  rotationMatrix[9] = Math.sin(angle);
  rotationMatrix[10] = Math.cos(angle);

  return matMult(rotationMatrix, mat);
}

export function rotateY(mat: Mat4, angle: number): Mat4 {
  const rotationMatrix = mat4Identity();

  rotationMatrix[0] = Math.cos(angle);
  rotationMatrix[2] = Math.sin(angle);
  rotationMatrix[8] = -1 * Math.sin(angle);
  rotationMatrix[10] = Math.cos(angle);

  return matMult(rotationMatrix, mat);
}

export function rotateZ(mat: Mat4, angle: number): Mat4 {
  const rotationMatrix = mat4Identity();

  rotationMatrix[0] = Math.cos(angle);
  rotationMatrix[1] = -1 * Math.sin(angle);
  rotationMatrix[4] = Math.sin(angle);
  rotationMatrix[5] = Math.cos(angle);

  return matMult(rotationMatrix, mat);
}

function translationMatrix(v: Vec3): Mat4 {
  const m = mat4Identity();
  m[3] = v[0];
  m[7] = v[1];
  m[11] = v[2];
  return m;
}

export function translate(mat: Mat4, delta: Vec3): Mat4 {
  const T = translationMatrix(delta);
  return matMult(T, mat); // T · M
}

