import { mat4Identity } from "./math/mat";
import { vec3 } from "./math/vec";
import type { Object3D } from "./types";

export async function parseObjFile(file: File | undefined): Promise<Object3D[]> {
  if (!file) {
    return [];
  }

  if (!file.name.endsWith(".obj")) {
    return [];
  }

  const text = await file.text();
  const lines = text.split(/\r?\n/);

  const objects: Object3D[] = [];

  let currentObject: Object3D | null = null;

  function newObject(name: string): Object3D {
    return { name, lines: [], faces: [], rotation: mat4Identity(), translation: mat4Identity(), vertices: [] }
  }

  function ensureObject(): boolean {
    if (currentObject !== null) return true;

    currentObject = newObject("default");
    objects.push(currentObject);
    return true;
  }

  for (let rawLine of lines) {
    let line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const hashIndex = line.indexOf("#");
    if (hashIndex !== -1) line = line.slice(0, hashIndex).trim();

    const parts = line.split(/\s+/); // Split on one or more spaces
    const tag = parts[0];

    if (tag === "o") {
      const name = parts.slice(1).join((" ")) || `object_${objects.length}`;
      currentObject = newObject(name);
      objects.push(currentObject);

      continue;
    }

    if (tag === "v") {
      if (!ensureObject()) continue;

      const x = Number(parts[1]);
      const y = Number(parts[2]);
      const z = Number(parts[3]);

      if (![x, y, z].every(Number.isFinite)) {
        console.log("Unexpected error while loading file, one of the coordinates of a vertex wasnt a valid number.");
        continue;
      }

      currentObject?.vertices.push(vec3(x, y, z));
      continue;
    }

    if (tag === "l" || tag === "f") {
      if (!currentObject) continue;

      const indices: number[] = [];
      for (let i = 1; i < parts.length; i++) {
        const idx = Number(parts[i].split("/")[0]);
        if (!Number.isInteger(idx) || idx === 0) {
          console.log("Unexpected error while loading file, one of the vertex indices in a face/line wasn't an integer.");
          continue;
        };

        // See Vertex Indices section
        // https://en.wikipedia.org/wiki/Wavefront_.obj_file 
        if (idx > 0) indices.push(idx - 1);
        if (idx < 0) indices.push(currentObject.vertices.length + idx);
      }
      if (tag == "l") currentObject.lines.push(indices);
      if (tag == "f") currentObject.faces.push(indices);
    }
  }

  return objects;
}
