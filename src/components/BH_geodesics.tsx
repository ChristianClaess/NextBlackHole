"use client";

import * as THREE from "three/webgpu";
import {
  texture,
  pow,
  vec4,
  screenUV,
  cross,
  normalize,
  Loop,
  Break,
  If,
  uniform,
  vec2,
  vec3,
  float,
  fract,
  sin,
  dot,
  Fn,
  asin,
  step,
  floor,
  atan,
  clamp,
  smoothstep,
  mix,
  length,
} from "three/tsl";

/* -------------------------------------------------------------------------- */
/*                                   Hashes                                   */
/* -------------------------------------------------------------------------- */

// 2D → 1D
const hash21 = Fn(([p]: any) => {
  const n = sin(dot(p, vec2(127.1, 311.7))).mul(43758.5453);
  return fract(n);
}) as any;

// 2D → 2D
const hash22 = Fn(([p]: any) => {
  const px = fract(sin(dot(p, vec2(127.1, 311.7))).mul(43758.5453));
  const py = fract(sin(dot(p, vec2(269.5, 183.3))).mul(43758.5453));
  return vec2(px, py);
}) as any;

// 3D → 1D
const hash31 = Fn(([p]: any) => {
  const n = sin(dot(p, vec3(127.1, 311.7, 74.7))).mul(43758.5453);
  return fract(n);
}) as any;

/* -------------------------------------------------------------------------- */
/*                                Star Field                                  */
/* -------------------------------------------------------------------------- */

export const createStarField = (uniforms: any) =>
  Fn(([rayDir]: any) => {
    const theta = atan(rayDir.z, rayDir.x);
    const phi = asin(clamp(rayDir.y, float(-1.0), float(1.0)));

    const gridScale = float(60.0).div(uniforms.starSize);
    const scaledCoord = vec2(theta, phi).mul(gridScale);

    const cell = floor(scaledCoord);
    const cellUV = fract(scaledCoord);

    const cellHash = hash21(cell);
    const starProb = step(
      float(1.0).sub(uniforms.starDensity),
      cellHash
    );

    const starPos = hash22(cell.add(42.0)).mul(0.8).add(0.1);
    const distToStar = length(cellUV.sub(starPos));

    const baseSizeVar = hash21(cell.add(100.0))
      .mul(0.03)
      .add(0.01);

    const finalStarSize = baseSizeVar.mul(uniforms.starSize);

    const starCore = smoothstep(finalStarSize, float(0.0), distToStar);
    const starGlow = smoothstep(
      finalStarSize.mul(3.0),
      float(0.0),
      distToStar
    ).mul(0.3);

    const starIntensity = starCore
      .add(starGlow)
      .mul(starProb);

    const colorTemp = hash21(cell.add(200.0));

    const starColor = mix(
      vec3(0.8, 0.9, 1.0),
      vec3(1.0, 0.95, 0.8),
      colorTemp
    );

    return starColor
      .mul(starIntensity)
      .mul(uniforms.starBrightness);
  });

/* -------------------------------------------------------------------------- */
/*                                Main Shader                                 */
/* -------------------------------------------------------------------------- */

export const createShader = (uniforms: any) => {
  const starField = createStarField(uniforms) as any;

  return Fn(() => {
    const camPos = uniforms.cameraPosition;
    const camTarget = uniforms.cameraTarget;

    const uv = screenUV.sub(0.5).mul(2.0);
    const aspect = uniforms.resolution.x.div(uniforms.resolution.y);
    const screenPos = vec2(uv.x.mul(aspect), uv.y);

    const worldUp = vec3(0.0, 1.0, 0.0);

    const camForward = normalize(camTarget.sub(camPos));
    const camRight = normalize(cross(worldUp, camForward));
    const camUp = cross(camForward, camRight);

    const rayPos = camPos.toVar("rayPos");
    const prevPos = camPos.toVar("prevPos");

    const rayDir = normalize(
      camForward
        .add(camRight.mul(screenPos.x))
        .add(camUp.mul(screenPos.y))
    ).toVar("rayDir");

    const rs = uniforms.blackHoleMass.mul(2.0);

    const captured = float(0.0).toVar("captured");
    const escaped = float(0.0).toVar("escaped");
    const alpha = float(0.0).toVar("alpha");
    const color = vec3(0.0).toVar("color");

    Loop(62, () => {
      If(
        escaped.greaterThan(0.5)
          .or(captured.greaterThan(0.5))
          .or(alpha.greaterThan(0.99)),
        () => {
          Break();
        }
      );

      const r = length(rayPos);

      If(r.lessThan(rs.mul(1.01)), () => {
        captured.assign(1.0);
        Break();
      });

      If(r.greaterThan(100.0), () => {
        escaped.assign(1.0);
        Break();
      });

      const toCenter = rayPos.negate().div(r);

      const bendStrength = rs
        .div(r.mul(r))
        .mul(uniforms.stepSize)
        .mul(uniforms.gravitationalLensing);

      rayDir.addAssign(toCenter.mul(bendStrength));
      rayDir.assign(normalize(rayDir));

      prevPos.assign(rayPos);
      rayPos.addAssign(rayDir.mul(uniforms.stepSize));
    });

    If(captured.lessThan(0.5), () => {
      escaped.assign(1.0);
    });

    If(escaped.greaterThan(0.5), () => {
      const bgColor = uniforms.starBackgroundColor.toVar("bgColor");
      bgColor.addAssign(starField(rayDir));
      color.assign(bgColor);
    });

    const finalColor = pow(color, vec3(1.0 / 2.2));
    return vec4(finalColor, 1.0);
  })();
};
