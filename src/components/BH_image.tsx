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
import { add } from "three/src/nodes/TSL.js";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const loadTextures = (uniforms: any) => {
    const loader = new THREE.TextureLoader();

    //milkyway
    
    const milkyway = loader.load("${basepath}/milkyway.jpg");
    uniforms.milkywayTexture = texture(milkyway);
    milkyway.generateMipmaps = false; // key for sharpness
    milkyway.magFilter = THREE.LinearFilter;
    milkyway.minFilter = THREE.LinearFilter;
    milkyway.needsUpdate = true;
    //stars
    const stars = loader.load("${basepath}/stars.png");
    uniforms.starTexture = texture(stars);


}


/* -------------------------------------------------------------------------- */
/*                                Main Shader                                 */
/* -------------------------------------------------------------------------- */

export const createShader = (uniforms: any) => {
    loadTextures(uniforms);

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

    const rs = uniforms.blackHoleMass.mul(2.0); //Schwartzschild radius r_s=2*M
    const captured = float(0.0).toVar("captured");
    const escaped = float(0.0).toVar("escaped");
    const alpha = float(0.0).toVar("alpha");
    const color = vec3(0.0).toVar("color");

    Loop(62, () => {
      If(
        escaped
          .greaterThan(0.5)
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
      // rayDir is normalized
      const theta = atan(rayDir.z, rayDir.x); // -pi..pi
      const phi = asin(clamp(rayDir.y, float(-1.0), float(1.0))); // -pi/2..pi/2

      // map to 0..1 equirectangular uv
      const u = theta.div(float(2.0 * Math.PI)).add(0.5);
      const v = phi.div(float(Math.PI)).add(0.5);

      const mw_color = uniforms.milkywayTexture.uv(vec2(u, v)).rgb;
      const star_color = uniforms.starTexture.uv(vec2(u, v)).rgb;
      const env = mw_color.mul(0.1).add(star_color.mul(0.5));
      color.assign(env.mul(0.9));
    });

    const finalColor = color;
    return vec4(finalColor, 1.0);
  })();
};
