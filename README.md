# Raycasted simulation of a black hole
This project is a real-time simulation of a black hole using WebGPU, ThreeJS and NextJS. At the moment it features gravitational lensing effects using WebGPU raycasting. In the future, I plan on integrating procedurally generated background (stars, nebula, galaxy), as well as an accretion disk and doppler shifts.
---

![Example figure]()
---
### Requirements
* needs a decent GPU
* Browser with WebGPU support (Chrome, Firefox)

### Installation
```bash
# install dependencies
npm install 

# start local server

npm run dev
```

--> Importantly, only use localhost:3000 as the network IP does not grant access to the GPU

### License
MIT