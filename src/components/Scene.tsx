"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { uniform } from "three/tsl";
import initHole from "./hole_image";

export default function Scene() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    initHole().then(({ renderer }) => {
      ref.current!.appendChild(renderer.domElement);
    });
  }, []);

  return <div ref={ref}/>;
}
