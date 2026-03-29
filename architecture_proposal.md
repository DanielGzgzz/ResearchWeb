# Proposed 3D Simulation Architecture: Fluid-Dynamic Topology

Based on the core mechanical framework of the Casimir Vacuum, the 3D visualization must evolve from static structural curves into a dynamic, continuous fluid medium representation.

## 1. Visualizing the Vacuum Medium
Instead of rendering empty space, the environment must be represented as a dense, high-pressure, hyper-elastic fluid.
*   **Volumetric Shader / Particle Grid:** A dense 3D grid of points or a volumetric raymarching shader that represents the neutral, resting state of the Casimir fluid.
*   **Physical Displacement:** When a wave passes, the grid must visually distort. The E-field is not an abstract arrow; it is the physical stretching and tearing (strain) of this grid. The B-field is the visual blur or velocity vector showing the grid violently snapping back to its neutral state.

## 2. Rendering the Photon (Linear Shear Wave)
*   **Geometry:** A propagating, self-cannibalizing gradient.
*   **Animation:** We cannot just move a static mesh. We must animate a "compression/decompression cycle" traveling through the fluid grid at velocity $c$.
*   **Visual Logic:**
    *   **Peak E (Strain):** Maximum geometric distortion of the local grid cells. The cells are stretched thin (tension).
    *   **Node (Derivative transfer):** The gradient collapses.
    *   **Peak B (Momentum):** The grid cells are moving at maximum velocity (vorticity), overshooting their neutral position. This can be visualized via motion blur or color-coding representing kinetic energy.
    *   **Cycle:** The overshoot causes compression in the opposite direction.

## 3. Rendering the Geons (Electron & Proton)
*   **Topology:** The Electron is a $4\pi$ Möbius double-loop. The Proton is a (3,2)-Torus Trefoil knot.
*   **Animation (The Trapped Wave):** The same compression/decompression cycle (Photon) is forced into a closed track.
*   **Standing Wave Dynamics:** The derivative $\nabla\times E$ is locked. The wave still tries to propagate at $c$ along the loop, but because the topology is closed, it becomes a standing geometric twist.
*   **Visual Logic:**
    *   The closed loop must display permanent structural tension (E-field strain) pushing outward against the surrounding Casimir fluid grid.
    *   The B-field momentum is trapped within the loop's track, creating continuous internal vorticity without forward spatial propagation of the entire object (unless external momentum is applied).

## Technical Implementation Plan (Three.js + GLSL)
1.  **The Fluid Canvas:** Create a large, dense `InstancedMesh` grid representing the Casimir vacuum.
2.  **The Wave Shader (GLSL):** Write a custom vertex/fragment shader applied to the fluid grid. The shader will calculate the spatial derivative and time-evolution of the wave equations.
    *   Input: `uTime`, `uWaveOrigin`, `uWaveDirection`.
    *   Vertex Shader: Displace the grid instances physically based on the strain tensor (E-field).
    *   Fragment Shader: Color the instances based on their kinetic velocity (B-field momentum).
3.  **Topological Constraints:** For the Electron/Proton, mathematically constrain the wave equations to follow the parametric curves of the Möbius and Trefoil knots. The fluid grid adjacent to these closed curves will experience permanent outward pressure (mass).