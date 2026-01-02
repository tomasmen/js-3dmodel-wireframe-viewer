export type Vec3 = Float32Array; // new Float32Array(3)
export type Mat4 = Float32Array; // new Float32Array(16)

export interface Object3D {
  name: string;
  lines: number[][];
  faces: number[][];
  rotation: Mat4;
  translation: Mat4;
  vertices: Vec3[];
}

export interface Scene {
  objects: Object3D[];
}

